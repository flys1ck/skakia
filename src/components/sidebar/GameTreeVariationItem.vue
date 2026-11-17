<template>
  <template v-for="{ node: lineNode, moveNumberLabel } in line" :key="lineNode.id">
    <p v-if="lineNode.startingComment" class="inline" v-html="lineNode.startingComment" />
    <button
      v-if="lineNode.move"
      :data-node-id="lineNode.id"
      class="text-primary relative inline-flex gap-0.5 rounded-sm border px-px font-bold"
      :class="lineNode.id === activeNodeId ? 'border-primary/60 bg-primary/10' : 'hover:bg-muted border-transparent'"
      @click="$emit('nodeselect', lineNode)"
    >
      <span v-if="moveNumberLabel">{{ moveNumberLabel }}</span>
      <span>{{ lineNode.move.san }}{{ formatAnnotations(lineNode.move.annotations) }}</span>
    </button>
    <p v-if="lineNode.comment" class="inline" v-html="lineNode.comment" />
  </template>
  <div v-if="branchNode" class="border-muted-foreground/50 relative border-l-2 pl-1">
    <span
      v-if="variationDepth !== 1"
      class="border-muted-foreground/50 absolute top-0 left-0 inline-block w-2.5 shrink-0 -translate-x-full border-t-2"
      aria-hidden="true"
    />
    <div class="flex -translate-x-1.5 items-start gap-0.5">
      <span class="border-muted-foreground/50 inline-block w-2 shrink-0 translate-y-2 border-t-2" aria-hidden="true" />
      <div class="inline-block">
        <GameTreeVariationItem
          v-if="branchNode.nextPosition"
          :node="branchNode.nextPosition"
          :active-node-id="activeNodeId"
          :variation-depth="variationDepth + 1"
          @nodeselect="(node) => $emit('nodeselect', node)"
        />
      </div>
    </div>
    <div
      v-for="variation in branchNode.variations"
      :key="variation.id"
      class="flex -translate-x-1.5 items-start gap-0.5"
    >
      <span class="border-muted-foreground/50 inline-block w-2 shrink-0 translate-y-2 border-t-2" aria-hidden="true" />
      <div>
        <GameTreeVariationItem
          :node="variation"
          :active-node-id="activeNodeId"
          :variation-depth="variationDepth + 1"
          @nodeselect="(node) => $emit('nodeselect', node)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PositionNode } from "@composables/useGameTree";
import { formatAnnotations } from "@utilities/move";
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    node: PositionNode;
    activeNodeId?: string;
    variationDepth?: number;
  }>(),
  { variationDepth: 1 }
);

defineEmits<{
  nodeselect: [node: PositionNode];
}>();

// The moves from `node` up to the next branching point. Rendering them in a loop keeps the component nesting as deep
// as the variations are nested, not as long as the line is.
const line = computed(() => {
  const entries: { node: PositionNode; moveNumberLabel: string }[] = [];
  let node: PositionNode | undefined = props.node;
  while (node) {
    entries.push({ node, moveNumberLabel: moveNumberLabel(node) });
    node = node.variations.length ? undefined : node.nextPosition;
  }
  return entries;
});

const branchNode = computed(() => {
  const lastNode = line.value[line.value.length - 1].node;
  return lastNode.variations.length ? lastNode : undefined;
});

function moveNumberLabel(node: PositionNode) {
  const moveNumber = Math.ceil(node.ply / 2);
  if (node.ply % 2 === 1) return `${moveNumber}.`;

  const previous = node.previousPosition;
  const resumesAfterBreak = previous?.variations.length || previous?.comment || node.startingComment;
  return resumesAfterBreak ? `${moveNumber}...` : "";
}
</script>
