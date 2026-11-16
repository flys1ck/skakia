<template>
  <Sidebar
    collapsible="icon"
    class="group-data-[side=left]:border-r-0 *:data-[slot=sidebar-inner]:bg-linear-to-b *:data-[slot=sidebar-inner]:from-rose-100 *:data-[slot=sidebar-inner]:to-mauve-100"
  >
    <SidebarHeader class="py-0">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            as-child
            class="group-data-[collapsible=icon]:size-12! group-data-[collapsible=icon]:p-2! hover:bg-transparent active:bg-transparent"
          >
            <RouterLink :to="navigationItems.analysis.to">
              <img :src="appLogo" alt="" class="size-8" />
              <span class="truncate font-serif text-[32px] leading-8 font-normal group-data-[collapsible=icon]:hidden"
                >Skakia</span
              >
            </RouterLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup class="pt-4">
        <SidebarGroupContent>
          <SidebarMenu class="gap-1">
            <SidebarMenuItem v-for="{ icon, name, to } in mainNavigationItems" :key="to">
              <SidebarMenuButton as-child :is-active="isItemActive(to)" :tooltip="name" :class="menuButtonClass">
                <RouterLink :to="to">
                  <Component :is="icon" />
                  <span>{{ name }}</span>
                </RouterLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            :is-active="settingsDialog.isOpen"
            :class="menuButtonClass"
            tooltip="Settings"
            @click="settingsDialog.isOpen = true"
          >
            <Settings />
            <span>Settings</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  </Sidebar>
</template>

<script setup lang="ts">
import appLogo from "@assets/images/logo.svg";
import { type NavigationItem, navigationItems } from "@data/navigationItems";
import { Settings } from "@lucide/vue";
import { useSettingsDialog } from "@stores/useSettingsDialog";
import { useRoute } from "vue-router";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// Collapsing keeps the expanded button size so icons stay in place; 14px inline padding centres them in the rail.
const menuButtonClass =
  "h-10 px-3.5 py-2.5 [&_svg]:size-5 hover:bg-white/20 active:bg-white/30 data-active:bg-white/30 data-active:shadow-xs data-active:ring-1 data-active:ring-mauve-950/5 group-data-[collapsible=icon]:h-10! group-data-[collapsible=icon]:w-12! group-data-[collapsible=icon]:px-3.5! group-data-[collapsible=icon]:py-2.5!";

const mainNavigationItems = [navigationItems.analysis, navigationItems.studies, navigationItems.games];

const settingsDialog = useSettingsDialog();

const route = useRoute();
// Analysis is aliased to "/", so the path alone does not identify it; the route name does.
function isItemActive(to: NavigationItem["to"]) {
  return route.name === to || route.path.startsWith(to);
}
</script>
