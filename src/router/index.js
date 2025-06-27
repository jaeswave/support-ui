import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("../views/HomeView.vue"),
  },
  {
    path: "/agent/dashboard",
    component: () => import("../views/AgentDashboard.vue"),
    meta: { requiresAuth: true, role: "agent" },
  },
  {
    path: "/dashboard",
    component: () => import("../views/UserDashboard.vue"),
    meta: { requiresAuth: true, role: "user" },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
