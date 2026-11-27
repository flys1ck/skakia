<template>
  <template v-if="username">
    <BadgeCheck class="size-4 shrink-0 text-blue-500" />
    <span class="truncate">Connected as {{ username }}</span>
  </template>
  <template v-else>Not connected</template>
</template>

<script setup lang="ts">
import { BadgeCheck } from "@lucide/vue";

defineProps<{
  username?: string;
}>();
</script>
