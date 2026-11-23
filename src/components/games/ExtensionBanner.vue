<template>
  <!-- role="alert" would interrupt screen readers for what is only a suggestion. -->
  <Alert role="note" class="has-data-[slot=alert-action]:pr-80">
    <Puzzle />
    <AlertTitle>Open games straight from your browser</AlertTitle>
    <AlertDescription>
      The Skakia browser extension adds an Analyze in Skakia button to finished games on Lichess and Chess.com.
    </AlertDescription>
    <AlertAction class="top-1/2 flex -translate-y-1/2 items-center gap-1">
      <Button v-for="store in EXTENSION_STORES" :key="store.browser" size="sm" @click="openUrl(store.url)">
        Get for {{ store.browser }}<ExternalLink data-icon="inline-end" />
      </Button>
      <Button variant="ghost" size="icon-sm" aria-label="Dismiss" @click="extensionPromo.isDismissed = true">
        <X />
      </Button>
    </AlertAction>
  </Alert>
</template>

<script setup lang="ts">
import { ExternalLink, Puzzle, X } from "@lucide/vue";
import { EXTENSION_STORES, useExtensionPromo } from "@stores/useExtensionPromo";
import { openUrl } from "@tauri-apps/plugin-opener";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const extensionPromo = useExtensionPromo();
</script>
