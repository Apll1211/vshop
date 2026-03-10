import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

export default pinia;

export * from "./admin";
export * from "./cart";
export * from "./category";
// 导出所有store
export * from "./user";
