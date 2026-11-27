<template>
  <Dialog v-model:open="settingsDialog.isOpen">
    <!--
      Fixed height: the study storage chart loads after opening, and a centered dialog would grow and jump.
      Reka would focus the active section, and WebKit draws its focus ring even when the dialog was opened by mouse.
    -->
    <DialogContent
      class="flex h-[min(calc(100vh-4rem),52rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl"
      @open-auto-focus="
        (event: Event) => {
          event.preventDefault();
          (event.currentTarget as HTMLElement | null)?.focus();
        }
      "
    >
      <DialogHeader class="border-b px-6 py-4">
        <DialogTitle>Settings</DialogTitle>
        <DialogDescription class="sr-only">Integrations, sound, study storage and credits.</DialogDescription>
      </DialogHeader>
      <TabsRoot v-model="settingsDialog.section" orientation="vertical" class="flex min-h-0 flex-1">
        <TabsList aria-label="Settings sections" class="flex w-56 shrink-0 flex-col overflow-y-auto border-r py-4">
          <TabsTrigger
            v-for="section in SECTIONS"
            :key="section.value"
            :value="section.value"
            :class="{ 'mt-auto': section.value === 'credits' }"
            class="text-foreground/80 hover:bg-accent hover:text-foreground focus-visible:ring-ring/50 data-[state=active]:bg-accent data-[state=active]:text-foreground flex w-full items-center gap-2.5 px-5 py-2 text-left text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-inset [&_svg]:size-4 [&_svg]:shrink-0"
          >
            <Component :is="section.icon" />
            {{ section.label }}
          </TabsTrigger>
        </TabsList>
        <TabsContent
          v-for="section in SECTIONS"
          :key="section.value"
          :value="section.value"
          class="min-w-0 flex-1 overflow-y-auto outline-none"
        >
          <Component :is="section.component" />
        </TabsContent>
      </TabsRoot>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import SettingsCredits from "@components/settings/SettingsCredits.vue";
import SettingsIntegrations from "@components/settings/SettingsIntegrations.vue";
import SettingsSound from "@components/settings/SettingsSound.vue";
import SettingsStudyStorage from "@components/settings/SettingsStudyStorage.vue";
import { Blocks, HardDrive, Heart, Volume2 } from "@lucide/vue";
import { type SettingsSection, useSettingsDialog } from "@stores/useSettingsDialog";
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from "reka-ui";
import type { Component } from "vue";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface SectionDefinition {
  value: SettingsSection;
  label: string;
  icon: Component;
  component: Component;
}

const SECTIONS: SectionDefinition[] = [
  {
    value: "integrations",
    label: "Integrations",
    icon: Blocks,
    component: SettingsIntegrations,
  },
  {
    value: "sound",
    label: "Sound",
    icon: Volume2,
    component: SettingsSound,
  },
  {
    value: "study-storage",
    label: "Study Storage",
    icon: HardDrive,
    component: SettingsStudyStorage,
  },
  {
    value: "credits",
    label: "Credits",
    icon: Heart,
    component: SettingsCredits,
  },
];

const settingsDialog = useSettingsDialog();
</script>
