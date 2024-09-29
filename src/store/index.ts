import { createPinia } from "pinia";
import piniaPluginPersist from "pinia-plugin-persist";
import { useOrg } from "./org";
import { useUser } from "./user";

const store = createPinia();
store.use(piniaPluginPersist);

export { useUser, useOrg };

export default store;
