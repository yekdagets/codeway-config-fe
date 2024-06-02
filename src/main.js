import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "./firebaseConfig";
import "@fortawesome/fontawesome-free/css/all.css";
import "./assets/global.css";

createApp(App).use(router).mount("#app");
