<template>
  <div class="home-container">
    <header>
      <img src="@/assets/logo.png" alt="Logo" class="logo" />
      <div class="user-menu">
        <select v-model="selectedCountry" @change="fetchConfigs">
          <option value="">All</option>
          <option
            v-for="country in countries"
            :key="country.code"
            :value="country.code"
          >
            {{ country.name }}
          </option>
        </select>
        <i class="fas fa-user" @click="toggleUserMenu"></i>
        <div v-if="showUserMenu" class="user-menu-dropdown">
          <button @click="signOutUser">Sign Out</button>
        </div>
      </div>
    </header>
    <main>
      <div class="table-container">
        <table class="config-table">
          <thead>
            <tr>
              <th>Parameter Key</th>
              <th>Value</th>
              <th>Description</th>
              <th @click="sortConfigs('createDate')" class="sortable">
                Create Date
                <span
                  :class="sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'"
                ></span>
              </th>
              <th v-if="!selectedCountry">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="sortedConfigs.length === 0">
              <td colspan="5">No data available</td>
            </tr>
            <tr v-else v-for="config in sortedConfigs" :key="config.id">
              <td>{{ config.key }}</td>
              <td>{{ config.value }}</td>
              <td>{{ config.description }}</td>
              <td>{{ config.createDate }}</td>
              <td v-if="!selectedCountry">
                <button @click="startEdit(config)" class="edit-button">
                  Edit
                </button>
                <button @click="deleteConfig(config.id)" class="delete-button">
                  Delete
                </button>
                <button
                  @click="openCountryConfigModal(config)"
                  class="country-config-button"
                >
                  Country Config
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="config-item-container" v-if="isMobile">
        <div
          class="config-item"
          v-for="config in sortedConfigs"
          :key="config.id"
        >
          <p><strong>Parameter Key:</strong> {{ config.key }}</p>
          <p><strong>Value:</strong> {{ config.value }}</p>
          <p><strong>Description:</strong> {{ config.description }}</p>
          <p><strong>Create Date:</strong> {{ config.createDate }}</p>
          <div class="button-group" v-if="!selectedCountry">
            <button @click="startEdit(config)" class="edit-button">Edit</button>
            <button @click="deleteConfig(config.id)" class="delete-button">
              Del
            </button>
            <button
              @click="openCountryConfigModal(config)"
              class="country-config-button"
            >
              Country Config
            </button>
          </div>
        </div>
      </div>
      <form
        v-if="!selectedCountry"
        @submit.prevent="addOrUpdateConfig"
        class="add-config-form"
      >
        <input
          type="text"
          v-model="newConfig.key"
          placeholder="New Parameter"
          required
        />
        <input
          type="text"
          v-model="newConfig.value"
          placeholder="Value"
          required
        />
        <input
          type="text"
          v-model="newConfig.description"
          placeholder="New Description"
          required
        />
        <button type="submit">{{ isEditing ? "Update" : "ADD" }}</button>
      </form>
      <div v-if="showCountryConfigModal" class="modal">
        <div class="modal-content">
          <span class="close" @click="closeCountryConfigModal">&times;</span>
          <h2>Country-Specific Configuration</h2>
          <div v-if="Object.keys(currentCountryConfigs).length === 0">
            No country-specific configurations available
          </div>
          <div v-else>
            <table class="config-table">
              <thead>
                <tr>
                  <th>Country</th>
                  <th>Value</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(config, countryCode) in currentCountryConfigs"
                  :key="countryCode"
                >
                  <td>{{ countryCode }}</td>
                  <td>{{ config.value }}</td>
                  <td>{{ config.description }}</td>
                  <td>
                    <button
                      @click="startEditCountryConfig(countryCode, config)"
                      class="edit-button"
                    >
                      Edit
                    </button>
                    <button
                      @click="deleteCountryConfig(countryCode)"
                      class="delete-button"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <form @submit.prevent="saveCountryConfig">
            <select
              v-model="country"
              required
              :disabled="isEditingCountryConfig"
            >
              <option value="" disabled selected>Select Country</option>
              <option
                v-for="country in availableCountries"
                :key="country.code"
                :value="country.code"
              >
                {{ country.name }}
              </option>
            </select>
            <input
              type="text"
              v-model="countryConfig.value"
              placeholder="Value"
              required
            />
            <input
              type="text"
              v-model="countryConfig.description"
              placeholder="Description"
              required
            />
            <button type="submit">
              {{ isEditingCountryConfig ? "Update" : "Save" }}
            </button>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from "vue";
import axiosInstance from "../axiosInstance";
import { getAuth, signOut } from "firebase/auth";
import { format } from "date-fns";

export default {
  name: "HomePage",
  setup() {
    const newConfig = ref({
      id: "",
      key: "",
      value: "",
      description: "",
      version: 0,
    });
    const configs = ref([]);
    const isEditing = ref(false);
    const showUserMenu = ref(false);
    const isMobile = ref(window.innerWidth <= 600);
    const sortOrder = ref("asc");
    const showCountryConfigModal = ref(false);
    const country = ref("");
    const countryConfig = ref({ value: "", description: "" });
    const currentConfig = ref(null);
    const currentCountryConfigs = ref({});
    const selectedCountry = ref("");
    const isEditingCountryConfig = ref(false);
    const countries = ref([
      { code: "US", name: "United States" },
      { code: "TR", name: "Turkey" },
    ]);

    const fetchConfigs = async () => {
      try {
        let response;
        if (selectedCountry.value) {
          response = await axiosInstance.get(
            `/configs?country=${selectedCountry.value}`
          );
        } else {
          response = await axiosInstance.get("/configs");
        }
        configs.value = response.data.map((config) => ({
          ...config,
          createDate: format(
            new Date(config.createDate),
            "yyyy-MM-dd HH:mm:ss"
          ),
        }));
      } catch (error) {
        console.error("Error fetching configurations:", error);
      }
    };

    const sortedConfigs = computed(() => {
      return [...configs.value].sort((a, b) => {
        const dateA = new Date(a.createDate);
        const dateB = new Date(b.createDate);
        if (sortOrder.value === "asc") {
          return dateA - dateB;
        } else {
          return dateB - dateA;
        }
      });
    });

    const sortConfigs = () => {
      sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
    };

    const addOrUpdateConfig = async () => {
      if (
        !newConfig.value.key ||
        !newConfig.value.value ||
        !newConfig.value.description
      ) {
        alert("All fields are required.");
        return;
      }

      try {
        if (isEditing.value) {
          await axiosInstance.put(
            `/configs/${newConfig.value.id}`,
            newConfig.value
          );
        } else {
          await axiosInstance.post("/configs", newConfig.value);
        }

        newConfig.value = {
          id: "",
          key: "",
          value: "",
          description: "",
          version: 0,
        };
        isEditing.value = false;
        fetchConfigs();
      } catch (error) {
        if (error.response && error.response.status === 409) {
          alert(
            "Conflict: This configuration was updated by another user. Please refresh and try again."
          );
        } else {
          console.error("Error adding or updating configuration:", error);
        }
      }
    };

    const deleteConfig = async (id) => {
      try {
        await axiosInstance.delete(`/configs/${id}`);
        fetchConfigs();
      } catch (error) {
        console.error("Error deleting configuration:", error);
      }
    };

    const startEdit = (config) => {
      newConfig.value = { ...config };
      isEditing.value = true;
    };

    const openCountryConfigModal = (config) => {
      currentConfig.value = config;
      currentCountryConfigs.value = config.countryConfigs || {};
      showCountryConfigModal.value = true;
    };

    const closeCountryConfigModal = () => {
      showCountryConfigModal.value = false;
      country.value = "";
      countryConfig.value = { value: "", description: "" };
      isEditingCountryConfig.value = false;
    };

    const saveCountryConfig = async () => {
      if (
        !country.value ||
        !countryConfig.value.value ||
        !countryConfig.value.description
      ) {
        alert("All fields are required.");
        return;
      }

      try {
        await axiosInstance.put(`/configs/${currentConfig.value.id}`, {
          ...currentConfig.value,
          version: currentConfig.value.version,
          country: country.value,
          countrySpecific: true,
          value: countryConfig.value.value,
          description: countryConfig.value.description,
        });

        fetchConfigs();
        closeCountryConfigModal();
      } catch (error) {
        if (error.response && error.response.status === 409) {
          alert(
            "Conflict: This configuration was updated by another user. Please refresh and try again."
          );
        } else {
          console.error("Error adding or updating configuration:", error);
        }
      }
    };

    const startEditCountryConfig = (countryCode, config) => {
      country.value = countryCode;
      countryConfig.value = { ...config };
      isEditingCountryConfig.value = true;
    };

    const deleteCountryConfig = async (countryCode) => {
      try {
        await axiosInstance.put(`/configs/${currentConfig.value.id}`, {
          ...currentConfig.value,
          version: currentConfig.value.version,
          country: countryCode,
          countrySpecific: true,
          value: "",
          description: "",
        });

        fetchConfigs();
        closeCountryConfigModal();
      } catch (error) {
        console.error("Error deleting country-specific configuration:", error);
      }
    };

    const toggleUserMenu = () => {
      showUserMenu.value = !showUserMenu.value;
    };

    const signOutUser = async () => {
      const auth = getAuth();
      await signOut(auth);
      window.location.href = "/signin";
    };

    const handleResize = () => {
      isMobile.value = window.innerWidth <= 600;
    };

    window.addEventListener("resize", handleResize);

    onMounted(fetchConfigs);

    watch(selectedCountry, fetchConfigs);

    const availableCountries = computed(() => {
      return countries.value.filter(
        (country) => !currentCountryConfigs.value[country.code]
      );
    });

    return {
      newConfig,
      configs,
      sortedConfigs,
      sortConfigs,
      addOrUpdateConfig,
      deleteConfig,
      startEdit,
      isEditing,
      toggleUserMenu,
      showUserMenu,
      signOutUser,
      isMobile,
      sortOrder,
      showCountryConfigModal,
      country,
      countryConfig,
      openCountryConfigModal,
      closeCountryConfigModal,
      saveCountryConfig,
      startEditCountryConfig,
      deleteCountryConfig,
      selectedCountry,
      countries,
      currentCountryConfigs,
      availableCountries,
      isEditingCountryConfig,
    };
  },
};
</script>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #1c1c1c;
  color: #fff;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: #2c2c2c;
}

.logo {
  width: 50px;
}

.user-menu {
  display: flex;
  gap: 20px;
  position: relative;
  font-size: 1.5em;
  color: #fff;
}

.country-select {
  border-radius: 6px;
  padding: 6px;
}

.user-menu-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: #333;
  border: 1px solid #444;
  padding: 10px;
  border-radius: 5px;
}

main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  overflow-y: auto;
  overflow-x: hidden;
}

.table-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.config-table {
  width: 100%;
  border-collapse: collapse;
}

.config-table th,
.config-table td {
  padding: 10px;
  border: 1px solid #444;
  text-align: left;
}

.config-table th {
  background-color: #333;
}

.config-table td {
  background-color: #2c2c2c;
}

button {
  margin: 0 5px;
  padding: 5px 10px;
  border-radius: 5px;
  border: none;
  cursor: pointer;
}

.edit-button {
  background-color: #007bff;
  color: #fff;
}

.delete-button {
  background-color: #dc3545;
  color: #fff;
}

.add-config-form {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  gap: 10px;
}

.add-config-form input {
  padding: 10px;
  border-radius: 5px;
  border: none;
  width: 200px;
}

.add-config-form button {
  padding: 10px 20px;
  border-radius: 5px;
  border: none;
  background-color: #28a745;
  color: #fff;
  cursor: pointer;
}

.sortable {
  cursor: pointer;
  user-select: none;
  position: relative;
  padding-right: 20px;
}

.sortable::after {
  content: "";
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

.arrow-up::after {
  content: "▲";
  margin-left: 5px;
  font-size: 10px;
}

.arrow-down::after {
  content: "▼";
  margin-left: 5px;
  font-size: 10px;
}
.modal {
  display: block;
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgb(0, 0, 0);
  background-color: rgba(0, 0, 0, 0.4);
}

.modal-content {
  background-color: #fefefe;
  margin: 15% auto;
  padding: 20px;
  border: 1px solid #888;
  width: 80%;
}

.close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
}

.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}

@media (max-width: 600px) {
  .table-container {
    display: none;
  }

  .config-item-container {
    display: block;
    width: 100%;
    padding: 10px;
  }

  .config-item {
    background-color: #2c2c2c;
    padding: 15px;
    margin-bottom: 10px;
    border-radius: 5px;
  }

  .config-item p {
    margin: 5px 0;
  }

  .button-group {
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
  }

  .edit-button {
    background-color: #007bff;
    color: #fff;
  }

  .delete-button {
    background-color: #dc3545;
    color: #fff;
  }

  .add-config-form {
    flex-direction: column;
    width: 100%;
  }

  .add-config-form input {
    width: 90%;
    margin-bottom: 10px;
  }
}
</style>
