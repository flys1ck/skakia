<template>
  <BaseContainer>
    <BaseSettingsSection heading="Study information">
      <template #description>
        Update <span class="font-semibold">{{ study.name }}</span> study information here.
      </template>
      <template #form>
        <form @submit.prevent="onSubmit">
          <FieldGroup>
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
            <div>
              <Button type="submit">Save</Button>
            </div>
          </FieldGroup>
        </form>
      </template>
    </BaseSettingsSection>
    <Separator class="my-8" />
    <BaseSettingsSection heading="Delete study">
      <template #description>
        This action is not reversible. All information related to the study
        <span class="font-semibold">{{ study.name }}</span> will be deleted permanently, including chapters, lines and
        positions.
      </template>
      <template #form>
        <form class="flex items-start" @submit.prevent="deleteStudy">
          <Button type="submit" variant="destructive">Yes, delete this study</Button>
        </form>
      </template>
    </BaseSettingsSection>
  </BaseContainer>
</template>

<script setup lang="ts">
import BaseContainer from "@components/base/BaseContainer.vue";
import BaseSettingsSection from "@components/base/BaseSettingsSection.vue";
import StudyAuthorsField from "@components/studies/StudyAuthorsField.vue";
import { navigationItems } from "@data/navigationItems";
import { db, execute, selectFirst } from "@services/database";
import { loadStudyAuthors, saveStudyAuthors } from "@services/studyAuthors";
import { useBreadcrumbs } from "@stores/useBreadcrumbs";
import { cleanAuthors } from "@utilities/studyAuthors";
import { reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { toast } from "vue-sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { EditableStudy } from "@/types";

const router = useRouter();
const route = useRoute("/studies/[studyId]/edit");

const studyId = Number(route.params.studyId);
const query = db.selectFrom("studies").selectAll().where("id", "=", studyId).compile();
const [study, authorsByStudy] = await Promise.all([selectFirst(query), loadStudyAuthors(studyId)]);
const studyFormData = reactive<EditableStudy>({
  name: study.name,
  authors: authorsByStudy.get(studyId) ?? [],
});
const nameError = ref<string>();

async function onSubmit() {
  const name = studyFormData.name.trim();
  nameError.value = name ? undefined : "Name is required";
  if (nameError.value) return;
  const authors = cleanAuthors(studyFormData.authors);

  try {
    const existingStudy = await selectFirst(
      db.selectFrom("studies").select("id").where("name", "=", name).where("id", "!=", studyId).compile()
    );
    nameError.value = existingStudy ? "A study with this name already exists" : undefined;
    if (nameError.value) return;

    await execute(db.updateTable("studies").set({ name }).where("id", "=", studyId).compile());
    await saveStudyAuthors(studyId, authors);
    studyFormData.authors = authors;
    toast.success("Study updated");
  } catch {
    toast.error("Couldn't update study", {
      description: "Please try again.",
    });
  }
}

async function deleteStudy() {
  const query = db.deleteFrom("studies").where("id", "=", studyId).compile();
  await execute(query);
  toast.success(`Study ${study.name} deleted`);
  router.push("/studies");
}

const { setBreadcrumbs } = useBreadcrumbs();
setBreadcrumbs([
  navigationItems.studies,
  {
    name: study.name,
    to: `/studies/${study.id}`,
  },
  {
    name: "Edit study",
    to: `/studies/${study.id}/edit`,
  },
]);
</script>
