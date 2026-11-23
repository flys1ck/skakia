import { useLocalStorage } from "@vueuse/core";
import { defineStore } from "pinia";
import { computed } from "vue";

export const EXTENSION_STORES = [
  { browser: "Chrome", url: "https://chromewebstore.google.com/detail/skakia/hhjegglkojeiindkedmhjkakiajdpfmh" },
  { browser: "Firefox", url: "https://addons.mozilla.org/firefox/addon/e83db780e8614224a9fa/" },
] as const;

export const useExtensionPromo = defineStore("extensionPromo", () => {
  const isDismissed = useLocalStorage("extensionPromoDismissed", false);
  // Game links only come from the browser extension, so one arriving means it is already installed.
  const hasOpenedGameLink = useLocalStorage("extensionGameLinkOpened", false);
  const isBannerVisible = computed(() => !isDismissed.value && !hasOpenedGameLink.value);

  return { isDismissed, hasOpenedGameLink, isBannerVisible };
});
