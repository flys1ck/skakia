<template>
  <StudiesEmptyState v-if="!studies.length && !pendingStudyName" />
  <Empty v-else-if="!visibleStudies.length && !pendingStudyName">
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <SearchX />
      </EmptyMedia>
      <EmptyTitle>No matching studies</EmptyTitle>
      <EmptyDescription>No study name or author contains “{{ search.trim() }}”.</EmptyDescription>
    </EmptyHeader>
  </Empty>
  <ul role="list" v-else class="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-4">
    <StudyCard
      v-for="study in visibleStudies"
      :key="study.id"
      :study="study"
      :cover-style="coverStyles.get(study.id)!"
      :collector-number="collectorNumbers.get(study.id)!"
      @delete="studyToDelete = study"
    />
    <li v-if="pendingStudyName">
      <div class="border-border flex aspect-[3/4] flex-col rounded-2xl border-2 border-dashed p-4">
        <h2 class="line-clamp-4 text-lg leading-snug font-semibold text-balance">{{ pendingStudyName }}</h2>
        <Spinner class="text-muted-foreground m-auto size-6" />
        <StudyImportProgress />
      </div>
    </li>
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
import { loadStudyAuthors } from "@services/studyAuthors";
import { useStudyImport } from "@stores/useStudyImport";
import { formatAuthor } from "@utilities/studyAuthors";
import { assignCollectorNumbers, assignCoverStyles } from "@utilities/studyCover";
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
import { StudySummary } from "@/types";
import StudiesEmptyState from "./StudiesEmptyState.vue";

const props = defineProps<{ search: string }>();

const query = db
  .selectFrom("studies")
  .leftJoin("chapters", "chapters.study", "studies.id")
  .leftJoin("lines", "lines.chapter", "chapters.id")
  .select(({ fn }) => [
    "studies.id",
    "studies.name",
    fn.count<number>("chapters.id").distinct().as("chapter_count"),
    fn.count<number>("lines.id").as("line_count"),
    sql<number>`count(case when lines.orientation = 'white' then 1 end)`.as("white_line_count"),
    sql<number>`count(case when lines.orientation = 'black' then 1 end)`.as("black_line_count"),
  ])
  .groupBy("studies.id")
  .orderBy("studies.created_at")
  .orderBy("studies.id")
  .compile();

function getStudySide(whiteLines: number, blackLines: number): StudySummary["side"] {
  if (whiteLines && blackLines) return "both";
  if (whiteLines) return "white";
  if (blackLines) return "black";
  return undefined;
}

async function loadStudies(): Promise<StudySummary[]> {
  const [rows, authorsByStudy] = await Promise.all([select(query), loadStudyAuthors()]);
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    authors: authorsByStudy.get(row.id) ?? [],
    chapterCount: row.chapter_count,
    lineCount: row.line_count,
    side: getStudySide(row.white_line_count, row.black_line_count),
  }));
}

const studies = ref(await loadStudies());
// Worked out from all studies, not only the ones the search shows, so a card keeps its color and number while searching.
const coverStyles = computed(() => assignCoverStyles(studies.value));
const collectorNumbers = computed(() => assignCollectorNumbers(studies.value));

const visibleStudies = computed(() => {
  const search = props.search.trim().toLocaleLowerCase();
  if (!search) return studies.value;
  return studies.value.filter((study) =>
    [study.name, ...study.authors.map(formatAuthor)].join("\n").toLocaleLowerCase().includes(search)
  );
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
