<template>
  <div class="flex min-h-9 items-center justify-between gap-6">
    <div class="min-w-0">
      <p class="text-sm font-medium">{{ label }}</p>
      <p v-if="$slots.description" class="text-muted-foreground flex items-center gap-1 text-sm">
        <slot name="description" />
      </p>
    </div>
    <div class="flex shrink-0 items-center gap-2">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
}>();

defineSlots<{
  description?: () => unknown;
  default: () => unknown;
}>();
</script>
