<template>
  <div class="sign-in-container">
    <img src="@/assets/logo.png" alt="Logo" class="logo" />
    <h1>Please sign in</h1>
    <form @submit.prevent="signIn">
      <input
        type="email"
        v-model="email"
        placeholder="E-mail address"
        required
      />
      <input
        type="password"
        v-model="password"
        placeholder="Password"
        required
      />
      <button type="submit">Sign in</button>
    </form>
    <p>Codeway © 2024</p>
  </div>
</template>

<script>
import { ref } from "vue";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

export default {
  name: "SignInPage",
  setup() {
    const email = ref("");
    const password = ref("");

    const signIn = async () => {
      const auth = getAuth();
      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email.value,
          password.value
        );
        console.log("Signed in:", userCredential.user);
        window.location.href = "/";
      } catch (error) {
        console.error("Error signing in:", error);
      }
    };

    return { email, password, signIn };
  },
};
</script>

<style scoped>
.sign-in-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #01092a;
  color: #fff;
}

.logo {
  width: 150px;
  margin-bottom: 30px;
}

h1 {
  margin-bottom: 20px;
  color: #ccc;
}

form {
  display: flex;
  flex-direction: column;
  align-items: center;
}

input {
  margin: 10px 0;
  padding: 10px;
  border-radius: 5px;
  border: none;
  width: 250px;
  max-width: 100%;
}

button {
  margin-top: 20px;
  padding: 10px 20px;
  border-radius: 5px;
  border: none;
  background-color: #007bff;
  color: #fff;
  cursor: pointer;
}

p {
  margin-top: 20px;
  color: #888;
}
</style>
