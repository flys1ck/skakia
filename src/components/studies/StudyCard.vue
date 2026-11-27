<template>
  <li>
    <ContextMenu>
      <ContextMenuTrigger as-child>
        <article
          ref="card"
          class="group has-focus-visible:ring-ring/50 data-[state=open]:ring-ring/50 relative isolate flex aspect-[3/4] flex-col overflow-hidden rounded-2xl text-neutral-900 ring-1 ring-black/5 transition-transform has-focus-visible:ring-3 data-[state=open]:ring-3 motion-safe:hover:-translate-y-0.5"
          @keydown="onKeydown"
        >
          <StudyCover
            :name="study.name"
            :cover-style="coverStyle"
            :side="study.side"
            :collector-number="collectorNumber"
          />
          <h2 class="line-clamp-4 p-4 text-lg leading-snug font-semibold text-balance">
            {{ study.name }}
          </h2>
          <div :id="detailsId" class="mt-auto space-y-3 p-4 pb-6">
            <StudyImportProgress
              v-if="isImporting"
              class="**:data-[slot=progress]:bg-black/10 [&_p]:text-neutral-600"
            />
            <p class="text-xs text-neutral-700 tabular-nums">
              {{ study.chapterCount }} {{ study.chapterCount === 1 ? "chapter" : "chapters" }} · {{ study.lineCount }}
              {{ study.lineCount === 1 ? "line" : "lines"
              }}<span v-if="study.side" class="sr-only">. {{ SIDE_LABELS[study.side] }}</span>
            </p>
          </div>
          <RouterLink
            :to="`/studies/${study.id}`"
            class="absolute inset-0 z-10 rounded-2xl focus:outline-hidden"
            tabindex="0"
            :aria-label="study.name"
            :aria-describedby="detailsId"
          />
          <!--
            Mouse users right-click the card; this button is the keyboard way in, so it only shows while the card has
            keyboard focus. The explicit tabindex keeps both in the Tab order on macOS with keyboard navigation off.
          -->
          <Button
            variant="secondary"
            size="icon-sm"
            tabindex="0"
            class="pointer-events-none absolute right-3 bottom-3 z-20 opacity-0 group-has-focus-visible:pointer-events-auto group-has-focus-visible:opacity-100"
            :aria-label="`More actions for ${study.name}`"
            @click="openMenuAt($event.currentTarget as HTMLElement)"
          >
            <Ellipsis />
          </Button>
        </article>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem as-child>
          <RouterLink :to="`/studies/${study.id}/import`"><FileUp />Import PGN</RouterLink>
        </ContextMenuItem>
        <ContextMenuItem as-child>
          <RouterLink :to="`/studies/${study.id}/edit`"><Pencil />Edit details</RouterLink>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive" :disabled="isImporting" @select="emit('delete')">
          <Trash2 />Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  </li>
</template>

<script setup lang="ts">
import StudyCover from "@components/studies/StudyCover.vue";
import StudyImportProgress from "@components/studies/StudyImportProgress.vue";
import { Ellipsis, FileUp, Pencil, Trash2 } from "@lucide/vue";
import { useStudyImport } from "@stores/useStudyImport";
import { StudyCoverStyle } from "@utilities/studyCover";
import { computed, useId, useTemplateRef } from "vue";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { StudySummary } from "@/types";

const props = defineProps<{ study: StudySummary; coverStyle: StudyCoverStyle; collectorNumber: string }>();
const emit = defineEmits<{ delete: [] }>();

const SIDE_LABELS: Record<NonNullable<StudySummary["side"]>, string> = {
  white: "Repertoire for white",
  black: "Repertoire for black",
  both: "Lines for both sides",
};

const card = useTemplateRef("card");
const detailsId = useId();
const studyImport = useStudyImport();
const isImporting = computed(() => studyImport.job?.studyId === props.study.id);

// The context menu only opens from a contextmenu event, which keyboards on macOS can't send.
function openMenuAt(anchor: HTMLElement) {
  const { left, bottom } = anchor.getBoundingClientRect();
  card.value?.dispatchEvent(
    new MouseEvent("contextmenu", { bubbles: true, cancelable: true, clientX: left, clientY: bottom })
  );
}

function onKeydown(event: KeyboardEvent) {
  if (event.key !== "ContextMenu" && !(event.shiftKey && event.key === "F10")) return;
  event.preventDefault();
  openMenuAt(event.target as HTMLElement);
}
</script>
