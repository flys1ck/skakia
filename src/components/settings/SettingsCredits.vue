<template>
  <SettingsGroup heading="Artwork">
    <template #description>Made by others and used in Skakia.</template>
    <SettingsRow label="Kosal pieces">
      <template #description>
        Study covers. By Philatype, licensed under
        <Button
          variant="link"
          class="text-muted-foreground hover:text-foreground h-auto p-0 font-normal underline"
          @click="openUrl('https://creativecommons.org/licenses/by/4.0/')"
        >
          CC BY 4.0
        </Button>
      </template>
      <Button variant="outline" @click="openUrl('https://github.com/philatype/kosal')">
        View<ExternalLink data-icon="inline-end" />
      </Button>
    </SettingsRow>
  </SettingsGroup>
</template>

<script setup lang="ts">
import SettingsGroup from "@components/settings/SettingsGroup.vue";
import SettingsRow from "@components/settings/SettingsRow.vue";
import { ExternalLink } from "@lucide/vue";
import { openUrl } from "@tauri-apps/plugin-opener";
import { Button } from "@/components/ui/button";
</script>
