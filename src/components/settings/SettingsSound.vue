<template>
  <SettingsGroup heading="Move Sounds">
    <template #description>Played when a piece moves or captures.</template>
    <SettingsRow label="Volume">
      <!-- Reka emits valueCommit before updating the model on keyboard input -->
      <Slider
        thumb-label="Volume"
        class="w-48"
        :min="0"
        :max="100"
        :step="5"
        v-model="settings.soundVolume"
        @value-commit="nextTick(() => playAudio('move'))"
      />
      <span class="text-muted-foreground w-10 text-right text-sm tabular-nums">{{ settings.soundVolume[0] }}%</span>
    </SettingsRow>
  </SettingsGroup>
</template>

<script setup lang="ts">
import SettingsGroup from "@components/settings/SettingsGroup.vue";
import SettingsRow from "@components/settings/SettingsRow.vue";
import { useSettings } from "@stores/useSettings";
import { playAudio } from "@utilities/audio";
import { nextTick } from "vue";
import { Slider } from "@/components/ui/slider";

const settings = useSettings();
</script>
