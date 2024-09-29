import { defineStore } from "pinia";

interface AppState {
  user: Record<string, any>;
  role: Record<string, any>;
  resourceCodes: string[];
}

export const useUser = defineStore("useUser", {
  state: (): AppState => ({
    user: {
      id: "",
      name: "",
      departmentCode: "",
      departmentName: "",
      departmentId: "",
      photo: "",
      idCard: "",
      userManagementDepartmentCodes: [],
    },
    role: {},
    resourceCodes: [],
  }),
  actions: {
    setUserInfo(data: any) {
      this.user = data.user;
      this.role = data.role;
      this.resourceCodes = data.resourceCodes;
      return true;
    },
  },
  persist: {
    enabled: true,
    strategies: [
      {
        key: "userInfo",
        storage: window.sessionStorage,
      },
    ],
  },
});
