import { createApp } from "vue";
import router from "@/router/index";
import { useRoute } from "@/router/useRouter";
import store from "@/store";
import App from "./App.vue";
import "element-plus/theme-chalk/src/message-box.scss";
import "element-plus/theme-chalk/src/message.scss";
import "element-plus/theme-chalk/src/loading.scss";
import "./styles/style.scss";
import { isAllow } from "./utils/utils";

// 声明全局变量属性
declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $allow: (code: string, isPrefix?: boolean) => boolean;
  }
}

useRoute(router);
const app = createApp(App);
app.config.globalProperties.$allow = isAllow;
app.config.errorHandler = (err) => {
  console.log("err", err);
};
app.use(store).use(router).mount("#app");
