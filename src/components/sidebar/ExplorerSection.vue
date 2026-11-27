<template>
  <!-- No open animation: the hidden tab panel uses display: none, and showing it again replays the animation -->
  <!-- Each header draws both its edges, so it overlaps the line above instead of doubling it -->
  <AccordionItem
    :value="value"
    class="not-first:-mt-px not-last:border-b-0 [&_[data-slot=accordion-content]]:animate-none!"
  >
    <AccordionTrigger
      class="bg-border hover:bg-foreground/15 items-center gap-1.5 rounded-none border-y-[color-mix(in_oklab,var(--foreground)_20%,var(--card))]! px-3 py-2 text-xs transition-none hover:no-underline"
    >
      <span class="flex grow items-center justify-between gap-2">
        <span>{{ heading }}</span>
        <span v-if="count" class="text-muted-foreground font-normal tabular-nums">{{ count }}</span>
      </span>
      <template #icon>
        <ChevronRight
          class="text-muted-foreground order-first size-3.5 shrink-0 group-aria-expanded/accordion-trigger:rotate-90"
        />
      </template>
    </AccordionTrigger>
    <AccordionContent class="py-0 [&_a]:no-underline">
      <slot />
    </AccordionContent>
  </AccordionItem>
</template>

<script setup lang="ts">
import { ChevronRight } from "@lucide/vue";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

defineProps<{
  value: string;
  heading: string;
  count?: string;
}>();
</script>
