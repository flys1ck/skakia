<template>
  <!-- TODO: shapes are not refreshing when there is no pointer movement -->
  <button
    class="hover:bg-muted flex w-full items-center gap-3 px-4 py-1 text-left text-sm"
    @click="
      () => {
        game.playMove(orig, dest);
        game.setAutoShapes([], 'temporary');
      }
    "
    @pointermove="() => game.setAutoShapes([{ brush: 'paleTeal', orig, dest }], 'temporary')"
    @pointerleave="() => game.setAutoShapes([], 'temporary')"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { useGame } from "@composables/useGame";
import { Key } from "@lichess-org/chessground/types";

defineProps<{
  game: ReturnType<typeof useGame>;
  orig: Key;
  dest: Key;
}>();
</script>
