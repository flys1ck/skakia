<template>
  <div class="divide-y">
    <SettingsGroup heading="Accounts">
      <template #description>Connect your accounts to browse and analyze your games.</template>
      <SettingsAccounts />
    </SettingsGroup>
    <SettingsGroup heading="Browser Extension">
      <template #description>Adds an Analyze in Skakia button to finished games on Lichess and Chess.com.</template>
      <SettingsRow v-for="store in EXTENSION_STORES" :key="store.browser" :label="store.browser">
        <Button variant="outline" @click="openUrl(store.url)">Install<ExternalLink data-icon="inline-end" /></Button>
      </SettingsRow>
    </SettingsGroup>
  </div>
</template>

<script setup lang="ts">
import SettingsAccounts from "@components/settings/SettingsAccounts.vue";
import SettingsGroup from "@components/settings/SettingsGroup.vue";
import SettingsRow from "@components/settings/SettingsRow.vue";
import { ExternalLink } from "@lucide/vue";
import { EXTENSION_STORES } from "@stores/useExtensionPromo";
import { openUrl } from "@tauri-apps/plugin-opener";
import { Button } from "@/components/ui/button";
</script>
