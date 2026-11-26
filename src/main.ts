import pinia from "@modules/pinia";
import queryClient from "@modules/queryClient";
import router from "@modules/router";
import { initLichessStore } from "@stores/useLichess";
import { VueQueryPlugin } from "@tanstack/vue-query";
import { initDeepLinks } from "@utilities/deepLinks";
import { createApp } from "vue";
import App from "./App.vue";
import "./assets/css/main.css";

// The window is transparent with a native blur behind it on macOS and Windows. Linux has no blur, so it keeps an opaque frame.
const userAgent = navigator.userAgent;
document.documentElement.dataset.platform = userAgent.includes("Mac")
  ? "macos"
  : userAgent.includes("Windows")
    ? "windows"
    : "linux";

const app = createApp(App);
app.use(pinia).use(router).use(VueQueryPlugin, { queryClient });

await initLichessStore();
await initDeepLinks(router);

app.mount("#app");
