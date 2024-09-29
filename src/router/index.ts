/* eslint-disable @typescript-eslint/no-explicit-any */
import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/index",
  },
  {
    path: "/loginByToken",
    component: () => import("../views/Login/index.vue"),
  },
  {
    path: "/expire",
    component: () => import("../views/Login/expire.vue"),
  },
  {
    path: "/index",
    component: () => import("../views/Main/index.vue"),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});
export default router;
