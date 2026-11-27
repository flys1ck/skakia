<template>
  <Field>
    <FieldLabel :for="inputId">Authors</FieldLabel>
    <Combobox v-model:open="open" ignore-filter :reset-search-term-on-blur="false">
      <ComboboxAnchor as-child>
        <TagsInput
          :model-value="authors"
          :convert-value="toAuthor"
          :display-value="(author) => formatAuthor(author as StudyAuthor)"
          add-on-blur
          class="bg-card border-input focus-within:border-ring focus-within:ring-ring/50 min-h-8 gap-1 rounded-lg px-1 py-1 shadow-none focus-within:ring-3"
          @update:model-value="setAuthors($event as StudyAuthor[])"
          @add-tag="searchTerm = ''"
        >
          <TagsInputItem
            v-for="author in authors"
            :key="author.name"
            :value="author"
            class="bg-secondary h-6 rounded-md data-[state=active]:ring-offset-0"
          >
            <!-- An invisible native select over the title, so a click opens the title list straight away. -->
            <label
              class="has-focus-visible:ring-ring/50 relative flex h-full items-center rounded-l-md pr-1 pl-2 hover:bg-black/5 has-focus-visible:ring-2"
            >
              <span v-if="author.title" class="font-semibold">{{ author.title }}</span>
              <ChevronDown v-else class="text-muted-foreground size-3.5" />
              <select
                :value="author.title ?? ''"
                :aria-label="`Title of ${author.name}`"
                class="absolute inset-0 cursor-pointer appearance-none opacity-0"
                @change="setTitle(author.name, ($event.target as HTMLSelectElement).value)"
              >
                <option value="">No title</option>
                <option v-for="title in CHESS_TITLES" :key="title" :value="title">{{ title }}</option>
              </select>
            </label>
            <TagsInputItemText class="pr-1 pl-0">{{ author.name }}</TagsInputItemText>
            <TagsInputItemDelete class="text-muted-foreground hover:text-foreground [&_svg]:size-3.5" />
          </TagsInputItem>
          <ComboboxInput v-model="searchTerm" as-child>
            <TagsInputInput
              :id="inputId"
              :placeholder="authors.length ? '' : 'Add authors'"
              spellcheck="false"
              class="placeholder:text-muted-foreground min-w-40 px-1.5"
              @focus="open = true"
            />
          </ComboboxInput>
        </TagsInput>
      </ComboboxAnchor>
      <ComboboxList v-if="suggestions.length || newAuthor" align="start">
        <ComboboxViewport>
          <ComboboxItem
            v-for="author in suggestions"
            :key="author.name"
            :value="author"
            @select.prevent="addAuthor(author)"
          >
            <span
              ><span v-if="author.title" class="font-semibold">{{ author.title }}</span> {{ author.name }}</span
            >
          </ComboboxItem>
          <ComboboxItem v-if="newAuthor" :value="newAuthor" @select.prevent="addAuthor(newAuthor)">
            <Plus />
            <span>
              Add
              <span v-if="newAuthor.title" class="font-semibold">{{ newAuthor.title }}</span>
              {{ newAuthor.name }}
            </span>
          </ComboboxItem>
        </ComboboxViewport>
      </ComboboxList>
    </Combobox>
  </Field>
</template>

<script setup lang="ts">
import { ChevronDown, Plus } from "@lucide/vue";
import { loadKnownAuthors } from "@services/studyAuthors";
import {
  CHESS_TITLES,
  StudyAuthor,
  formatAuthor,
  isChessTitle,
  parseAuthor,
  toKnownAuthor,
} from "@utilities/studyAuthors";
import { ComboboxInput } from "reka-ui";
import { computed, ref, useId } from "vue";
import { Combobox, ComboboxAnchor, ComboboxItem, ComboboxList, ComboboxViewport } from "@/components/ui/combobox";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  TagsInput,
  TagsInputInput,
  TagsInputItem,
  TagsInputItemDelete,
  TagsInputItemText,
} from "@/components/ui/tags-input";

const MAX_SUGGESTIONS = 8;

const authors = defineModel<StudyAuthor[]>({ required: true });

const inputId = useId();
const open = ref(false);
const searchTerm = ref("");
const knownAuthors = await loadKnownAuthors();

const isAdded = (name: string) => authors.value.some((author) => author.name.toLowerCase() === name.toLowerCase());

const suggestions = computed(() => {
  const term = searchTerm.value.trim().toLowerCase();
  return knownAuthors
    .filter((author) => !isAdded(author.name) && formatAuthor(author).toLowerCase().includes(term))
    .slice(0, MAX_SUGGESTIONS);
});

const newAuthor = computed(() => {
  if (!searchTerm.value.trim()) return undefined;
  const author = toAuthor(searchTerm.value);
  if (isAdded(author.name)) return undefined;
  const isKnown = knownAuthors.some(
    (known) => formatAuthor(known).toLowerCase() === formatAuthor(author).toLowerCase()
  );
  return isKnown ? undefined : author;
});

// Typing a title overrides the known one; typing a known name alone picks the known author, title included.
function toAuthor(text: string): StudyAuthor {
  const author = parseAuthor(text);
  return author.title ? author : toKnownAuthor(author, knownAuthors);
}

function setAuthors(values: StudyAuthor[]) {
  authors.value = values.filter(
    (author, index) =>
      author.name && values.findIndex((other) => other.name.toLowerCase() === author.name.toLowerCase()) === index
  );
}

function setTitle(name: string, value: string) {
  const title = isChessTitle(value) ? value : null;
  authors.value = authors.value.map((author) =>
    author.name.toLowerCase() === name.toLowerCase() ? { ...author, title } : author
  );
}

function addAuthor(author: StudyAuthor) {
  setAuthors([...authors.value, author]);
  searchTerm.value = "";
}
</script>
