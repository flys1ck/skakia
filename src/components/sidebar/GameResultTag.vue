<template>
  <Badge variant="outline" class="rounded-sm font-normal" :class="resultTagClasses">{{ resultText }}</Badge>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Badge } from "@/components/ui/badge";

const props = defineProps<{
  result: "white" | "black" | null;
}>();

const resultText = computed(() => {
  switch (props.result) {
    case "white":
      return "1 - 0";
    case "black":
      return "0 - 1";
    case null:
      return "½ - ½";
    default:
      return "-";
  }
});

const resultTagClasses = computed(() => ({
  "bg-white text-mauve-950": props.result === "white",
  "bg-mauve-300 text-mauve-800": props.result === null,
  "bg-mauve-800 text-mauve-50": props.result === "black",
}));
</script>
