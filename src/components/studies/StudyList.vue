<template>
  <StudiesEmptyState v-if="!studies.length && !pendingStudyName" />
  <Empty v-else-if="!visibleStudies.length && !pendingStudyName">
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <SearchX />
      </EmptyMedia>
      <EmptyTitle>No matching studies</EmptyTitle>
      <EmptyDescription>No study name or description contains “{{ search.trim() }}”.</EmptyDescription>
    </EmptyHeader>
  </Empty>
  <ul role="list" v-else class="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-4">
    <li v-if="pendingStudyName">
      <div class="border-border flex aspect-[3/4] flex-col rounded-2xl border-2 border-dashed p-4">
        <h2 class="line-clamp-4 text-lg leading-snug font-semibold text-balance">{{ pendingStudyName }}</h2>
        <Spinner class="text-muted-foreground m-auto size-6" />
        <StudyImportProgress />
      </div>
    </li>
    <StudyCard
      v-for="study in visibleStudies"
      :key="study.id"
      :study="study"
      :cover-style="coverStyles.get(study.id)!"
      @delete="studyToDelete = study"
    />
  </ul>
  <Dialog :open="!!studyToDelete" @update:open="(open: boolean) => !open && (studyToDelete = undefined)">
    <DialogContent :show-close-button="false">
      <DialogHeader>
        <DialogTitle>Delete {{ studyToDelete?.name }}?</DialogTitle>
        <DialogDescription>
          All of its chapters, lines and positions will be deleted permanently. This can't be undone.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose as-child>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button variant="destructive" @click="deleteStudy">Delete study</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import StudyCard from "@components/studies/StudyCard.vue";
import StudyImportProgress from "@components/studies/StudyImportProgress.vue";
import { SearchX } from "@lucide/vue";
import { db, execute, select } from "@services/database";
import { useStudyImport } from "@stores/useStudyImport";
import { assignCoverStyles } from "@utilities/studyCover";
import { sql } from "kysely";
import { computed, ref, watch } from "vue";
import { toast } from "vue-sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { StudySort, StudySummary } from "@/types";
import StudiesEmptyState from "./StudiesEmptyState.vue";

const props = defineProps<{ search: string; sort: StudySort }>();

const query = db
  .selectFrom("studies")
  .leftJoin("chapters", "chapters.study", "studies.id")
  .leftJoin("lines", "lines.chapter", "chapters.id")
  .select(({ fn }) => [
    "studies.id",
    "studies.name",
    "studies.description",
    "studies.created_at",
    fn.count<number>("chapters.id").distinct().as("chapter_count"),
    fn.count<number>("lines.id").as("line_count"),
    sql<string | null>`max(lines.created_at)`.as("last_line_created_at"),
    sql<number>`count(case when lines.orientation = 'white' then 1 end)`.as("white_line_count"),
    sql<number>`count(case when lines.orientation = 'black' then 1 end)`.as("black_line_count"),
  ])
  .groupBy("studies.id")
  .compile();

function getStudySide(whiteLines: number, blackLines: number): StudySummary["side"] {
  if (whiteLines && blackLines) return "both";
  if (whiteLines) return "white";
  if (blackLines) return "black";
  return undefined;
}

async function loadStudies(): Promise<StudySummary[]> {
  const rows = await select(query);
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.last_line_created_at ?? row.created_at,
    chapterCount: row.chapter_count,
    lineCount: row.line_count,
    side: getStudySide(row.white_line_count, row.black_line_count),
  }));
}

const studies = ref(await loadStudies());
// Worked out from all studies, not only the ones the search shows, so a card keeps its color while searching.
const coverStyles = computed(() => assignCoverStyles(studies.value));

const SORTERS: Record<StudySort, (a: StudySummary, b: StudySummary) => number> = {
  recent: (a, b) => b.updatedAt.localeCompare(a.updatedAt) || b.id - a.id,
  name: (a, b) => a.name.localeCompare(b.name),
  created: (a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id,
};

const visibleStudies = computed(() => {
  const search = props.search.trim().toLocaleLowerCase();
  const matching = search
    ? studies.value.filter((study) => `${study.name}\n${study.description ?? ""}`.toLocaleLowerCase().includes(search))
    : studies.value;
  return matching.toSorted(SORTERS[props.sort]);
});

const studyImport = useStudyImport();
const pendingStudyName = computed(() =>
  studyImport.job && studyImport.job.studyId === undefined ? studyImport.job.studyName : undefined
);
watch(
  () => studyImport.job,
  async (job, previousJob) => {
    if (!job && previousJob) studies.value = await loadStudies();
  }
);

const studyToDelete = ref<StudySummary>();

async function deleteStudy() {
  if (!studyToDelete.value) return;
  const { id, name } = studyToDelete.value;
  try {
    await execute(db.deleteFrom("studies").where("id", "=", id).compile());
    studies.value = studies.value.filter((study) => study.id !== id);
    toast.success(`Study ${name} deleted`);
  } catch {
    toast.error(`Couldn't delete ${name}`, { description: "Please try again." });
  } finally {
    studyToDelete.value = undefined;
  }
}
</script>
