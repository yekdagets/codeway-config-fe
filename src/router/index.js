import { createRouter, createWebHistory } from "vue-router";
import HomePage from "../views/HomePage.vue";
import SignInPage from "../views/SignInPage.vue";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const routes = [
  {
    path: "/",
    name: "HomePage",
    component: HomePage,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/signin",
    name: "SignInPage",
    component: SignInPage,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const auth = getAuth();
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

  if (requiresAuth) {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        next();
      } else {
        next("/signin");
      }
    });
  } else {
    next();
  }
});

export default router;
