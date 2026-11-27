<template>
  <section class="px-8 py-6">
    <h3 class="text-sm font-semibold">{{ heading }}</h3>
    <p class="text-muted-foreground mt-1 text-sm"><slot name="description" /></p>
    <div class="mt-5 space-y-5"><slot /></div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  heading: string;
}>();

defineSlots<{
  description: () => unknown;
  default: () => unknown;
}>();
</script>
