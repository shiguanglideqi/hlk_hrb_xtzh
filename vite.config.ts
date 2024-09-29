import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import { resolve } from "path";
import { VersionUpdate } from "./src/plugins/VersionUpdate";
import { SpriteBuild } from "./src/plugins/SpriteBuild";
import { name } from "./package.json";

const now = new Date().getTime();

export default defineConfig({
  define: {
    "process.env": {},
    __APP_VERSION__: now,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  plugins: [
    AutoImport({
      // vue函数的自动导入
      imports: [
        "vue",
        "vue-router",
        "pinia",
        "@vueuse/core",
        { "element-plus/es": ["ElLoading", "ElMessage", "ElMessageBox"] },
      ],
      dts: "src/types/auto-imports.d.ts",
      resolvers: [
        ElementPlusResolver({
          importStyle: "sass",
        }),
      ],
    }),
    Components({
      dts: "src/types/components.d.ts",
      resolvers: [ElementPlusResolver({ importStyle: "sass" })],
    }),
    vue(),
    VersionUpdate({
      version: now,
      name,
    }),
    SpriteBuild(),
  ],
});
