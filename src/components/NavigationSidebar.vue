<template>
  <nav
    aria-label="Main"
    data-tauri-drag-region
    class="text-sidebar-foreground macos:pt-16 flex w-18 shrink-0 flex-col items-center gap-5 pt-3 pb-4"
  >
    <ul class="flex flex-col items-center gap-3">
      <li v-for="{ icon, name, to } in mainNavigationItems" :key="to">
        <RouterLink
          :to="to"
          :data-active="isItemActive(to) || undefined"
          :aria-current="isItemActive(to) ? 'page' : undefined"
          :class="itemClass"
        >
          <Component :is="icon" />
          {{ name }}
        </RouterLink>
      </li>
    </ul>
    <Tooltip>
      <TooltipTrigger as-child>
        <button
          type="button"
          class="mt-auto"
          :class="itemClass"
          :data-active="settingsDialog.isOpen || undefined"
          :aria-keyshortcuts="isMac ? 'Meta+,' : 'Control+,'"
          @click="settingsDialog.open()"
        >
          <Settings />
          Settings
        </button>
      </TooltipTrigger>
      <TooltipContent side="right">
        Open settings
        <Kbd>{{ isMac ? "⌘" : "Ctrl" }} ,</Kbd>
      </TooltipContent>
    </Tooltip>
  </nav>
</template>

<script setup lang="ts">
import { type NavigationItem, navigationItems } from "@data/navigationItems";
import { Settings } from "@lucide/vue";
import { useSettingsDialog } from "@stores/useSettingsDialog";
import { onKeyStroke } from "@vueuse/core";
import { useRoute } from "vue-router";
import { Kbd } from "@/components/ui/kbd";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const itemClass =
  "flex w-16 flex-col items-center gap-1.5 rounded-lg py-2 text-xs font-medium outline-none transition-colors [&_svg]:size-5 hover:bg-white/45 active:bg-white/60 data-active:bg-white/70 data-active:shadow-xs data-active:ring-1 data-active:ring-mauve-950/5 focus-visible:ring-2 focus-visible:ring-sidebar-ring";

const mainNavigationItems = [navigationItems.analysis, navigationItems.studies, navigationItems.games];

const settingsDialog = useSettingsDialog();
const isMac = document.documentElement.dataset.platform === "macos";
onKeyStroke(",", (event) => {
  if (!(isMac ? event.metaKey : event.ctrlKey)) return;
  event.preventDefault();
  settingsDialog.open();
});

const route = useRoute();
// Analysis is aliased to "/", so the path alone does not identify it; the route name does.
function isItemActive(to: NavigationItem["to"]) {
  return route.name === to || route.path.startsWith(to);
}
</script>
