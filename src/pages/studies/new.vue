<template>
  <BaseContainer>
    <form @submit.prevent="onSubmit">
      <FieldGroup class="border-b pb-12">
        <Field :data-invalid="!!nameError">
          <FieldLabel for="study-name">Name</FieldLabel>
          <Input
            id="study-name"
            name="name"
            spellcheck="false"
            :aria-invalid="!!nameError"
            v-model="studyFormData.name"
          />
          <FieldError v-if="nameError">{{ nameError }}</FieldError>
        </Field>
        <StudyAuthorsField v-model="studyFormData.authors" />
      </FieldGroup>
      <FieldSet class="mt-8">
        <FieldLegend>Import PGN</FieldLegend>
        <FieldDescription>Optional. You can also import PGN files later from the study page.</FieldDescription>
        <FieldGroup>
          <StudyImportFields v-model:files="files" v-model:settings="settings" :headers="headers" :plan="plan" />
        </FieldGroup>
      </FieldSet>
      <div class="mt-6 flex items-center justify-end gap-x-6">
        <Button variant="outline" @click="$router.push('/studies')">Cancel</Button>
        <Button type="submit" :disabled="!!lineCount && !!studyImport.job">Save</Button>
      </div>
    </form>
  </BaseContainer>
</template>

<script setup lang="ts">
import BaseContainer from "@components/base/BaseContainer.vue";
import StudyAuthorsField from "@components/studies/StudyAuthorsField.vue";
import StudyImportFields from "@components/studies/StudyImportFields.vue";
import { useStudyImportPlan } from "@composables/useStudyImportPlan";
import { navigationItems } from "@data/navigationItems";
import { db, selectFirst } from "@services/database";
import { loadKnownAuthors } from "@services/studyAuthors";
import { importStudy } from "@services/studyImport";
import { useBreadcrumbs } from "@stores/useBreadcrumbs";
import { useStudyImport } from "@stores/useStudyImport";
import { StudyAuthor, cleanAuthors, parseAnnotator, toKnownAuthor } from "@utilities/studyAuthors";
import { reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { toast } from "vue-sonner";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { EditableStudy } from "@/types";

const { setBreadcrumbs } = useBreadcrumbs();
setBreadcrumbs([
  navigationItems.studies,
  {
    name: "New Study",
    to: "/studies/new",
  },
]);

const router = useRouter();
const studyFormData = reactive<EditableStudy>({
  name: "",
  authors: [],
});
const nameError = ref<string>();
const studyImport = useStudyImport();
const { files, games, settings, headers, plan, lineCount } = useStudyImportPlan();

let suggestedName = "";
watch(games, (games) => {
  if (studyFormData.name.trim() && studyFormData.name !== suggestedName) return;
  suggestedName = games[0]?.headers.get("StudyName") ?? files.value[0]?.name.replace(/\.pgn$/i, "") ?? "";
  studyFormData.name = suggestedName;
});

const knownAuthors = await loadKnownAuthors();
let suggestedAuthors: StudyAuthor[] = [];
watch(games, (games) => {
  const hasOwnAuthors = JSON.stringify(cleanAuthors(studyFormData.authors)) !== JSON.stringify(suggestedAuthors);
  if (hasOwnAuthors) return;
  const annotator = games.find((game) => game.headers.get("Annotator")?.trim())?.headers.get("Annotator") ?? "";
  // A PGN may carry an author's title from when it was written, so the title the app already knows wins.
  suggestedAuthors = parseAnnotator(annotator).map((author) => toKnownAuthor(author, knownAuthors));
  studyFormData.authors = suggestedAuthors.map((author) => ({ ...author }));
});

async function onSubmit() {
  const name = studyFormData.name.trim();
  nameError.value = name ? undefined : "Name is required";
  if (nameError.value) return;
  const authors = cleanAuthors(studyFormData.authors);

  try {
    const existingStudy = await selectFirst(db.selectFrom("studies").select("id").where("name", "=", name).compile());
    nameError.value = existingStudy ? "A study with this name already exists" : undefined;
    if (nameError.value) return;

    const target = { type: "newStudy", name, authors } as const;
    if (plan.value && lineCount.value) {
      void studyImport.start(target, plan.value, name);
      await router.push("/studies");
      return;
    }

    const studyId = await importStudy(target, { chapters: [], warnings: [] }, () => {});
    toast.success(`Study ${name} created`);
    router.push(`/studies/${studyId}`);
  } catch {
    toast.error("Couldn't create study", {
      description: "Please try again.",
    });
  }
}
</script>
