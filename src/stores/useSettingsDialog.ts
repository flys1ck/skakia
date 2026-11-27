import { defineStore } from "pinia";
import { ref } from "vue";

export type SettingsSection = "integrations" | "sound" | "study-storage" | "credits";

export const useSettingsDialog = defineStore("settingsDialog", () => {
  const isOpen = ref(false);
  const section = ref<SettingsSection>("integrations");

  function open(initialSection?: SettingsSection) {
    if (initialSection) section.value = initialSection;
    isOpen.value = true;
  }

  return { isOpen, section, open };
});
