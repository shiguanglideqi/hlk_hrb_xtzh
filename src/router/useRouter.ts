import { NavigationGuardNext, RouteLocationNormalized, Router } from "vue-router";

export const useRoute = (router: Router) => {
  router.beforeEach((to: any, _from: RouteLocationNormalized, next: NavigationGuardNext) => {
    // if (to.path === "/login") {
    //   next();
    //   return false;
    // }

    // if (!sessionStorage.getItem("token")) {
    //   next("/login");
    //   return false;
    // }

    next();
  });
};
