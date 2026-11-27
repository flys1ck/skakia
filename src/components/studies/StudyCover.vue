<template>
  <div aria-hidden="true" class="absolute inset-0 -z-10 overflow-hidden" :style="{ backgroundColor: cover.background }">
    <!-- The mask makes this layer its own group, so it repeats the background for the black piece to multiply onto. -->
    <div
      class="absolute inset-0 [mask-image:linear-gradient(to_bottom,transparent,black_42%,black_calc(100%_-_5rem),transparent_calc(100%_-_2.25rem))]"
      :style="{ backgroundColor: cover.background }"
    >
      <svg class="absolute inset-0 size-full" :viewBox="`0 0 ${COLUMNS} ${ROWS}`" preserveAspectRatio="xMidYMid slice">
        <rect
          v-for="(pixel, index) in cover.pixels"
          :key="index"
          :x="pixel.x"
          :y="pixel.y"
          :width="pixel.size"
          :height="pixel.size"
          :fill="cover.tint"
          :opacity="pixel.opacity"
        />
      </svg>
      <img
        v-for="piece in cover.pieces"
        :key="piece.src"
        :src="piece.src"
        alt=""
        class="absolute aspect-square max-w-none"
        :class="piece.color === 'w' ? 'opacity-25' : 'opacity-15 mix-blend-multiply'"
        :style="piece.style"
      />
    </div>
    <!-- An ellipse reaching the corners passes the edge midpoints at about 70%, so the frame fades there and keeps its corners. -->
    <div
      class="absolute inset-2.5 rounded-md border [mask-image:radial-gradient(rgb(0_0_0/0.3)_72%,rgb(0_0_0/0.7))]"
      :style="{ borderColor: cover.tint }"
    />
    <span
      class="absolute top-2.5 right-3 -translate-y-1/2 px-1 text-[0.625rem] leading-none tracking-wider tabular-nums"
      :style="{ color: cover.ink, backgroundColor: cover.background }"
    >
      {{ collectorNumber }}
    </span>
    <span
      v-if="side"
      class="absolute bottom-2.5 left-3 translate-y-1/2 px-1"
      :style="{ color: cover.ink, backgroundColor: cover.background }"
    >
      <svg class="size-2.5" viewBox="0 0 10 10">
        <circle cx="5" cy="5" r="4" fill="none" stroke="currentColor" stroke-width="1.2" />
        <circle v-if="side === 'black'" cx="5" cy="5" r="4" fill="currentColor" />
        <path v-else-if="side === 'both'" d="M5 1a4 4 0 0 0 0 8z" fill="currentColor" />
      </svg>
    </span>
  </div>
</template>

<script setup lang="ts">
import { createSeededRandom } from "@utilities/random";
import { coverColors, StudyCoverStyle } from "@utilities/studyCover";
import { computed } from "vue";
import { StudySummary } from "@/types";

const props = defineProps<{
  name: string;
  coverStyle: StudyCoverStyle;
  side: StudySummary["side"];
  collectorNumber: string;
}>();

const COLUMNS = 15;
const ROWS = 20;
const PIECE_URLS = import.meta.glob<string>("/src/assets/pieces/kosal/*.svg", {
  eager: true,
  query: "?url",
  import: "default",
});

const cover = computed(() => {
  const random = createSeededRandom(props.name);
  // The first number chose the hue in assignCoverStyles; skipping it keeps each study's pattern unchanged.
  random();
  const { hue, piece: type } = props.coverStyle;

  const originX = random() < 0.5 ? 0 : COLUMNS;
  const originY = random() * ROWS;
  const reach = Math.hypot(COLUMNS, ROWS) * (0.45 + random() * 0.25);
  const pixels = [];
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLUMNS; x++) {
      const density = 1 - Math.hypot(x + 0.5 - originX, y + 0.5 - originY) / reach;
      if (density <= 0 || random() > density ** 1.5) continue;
      const size = random() < density * 0.5 ? 0.9 : 0.45;
      pixels.push({ x: x + (1 - size) / 2, y: y + (1 - size) / 2, size, opacity: 0.3 + random() * 0.6 * density });
    }
  }

  const placements =
    props.side === "both"
      ? [
          { color: "w", width: "90%", left: "-28%", bottom: "-2%" },
          { color: "b", width: "90%", right: "-28%", bottom: "-12%" },
        ]
      : props.side
        ? [{ color: props.side[0], width: "115%", right: "-30%", bottom: "-6%" }]
        : [];
  const pieces = placements.map(({ color, ...position }) => ({
    color,
    src: PIECE_URLS[`/src/assets/pieces/kosal/${type}${color}.svg`],
    style: position,
  }));

  return {
    ...coverColors(hue),
    pixels,
    pieces,
  };
});
</script>
