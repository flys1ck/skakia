<template>
  <BaseContainer>
    <BaseToolbar>
      <template #start>
        <div class="relative w-64">
          <Search class="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input v-model="search" type="search" placeholder="Search studies" aria-label="Search studies" class="pl-8" />
        </div>
      </template>
      <template #end>
        <Button as-child>
          <RouterLink to="/studies/new"><Plus data-icon="inline-start" />Create study</RouterLink>
        </Button>
      </template>
    </BaseToolbar>
    <Suspense>
      <StudyList :search="search" />
      <template #fallback>
        <div class="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-4">
          <StudyCardSkeleton v-for="index in 6" :key="index" />
        </div>
      </template>
    </Suspense>
  </BaseContainer>
</template>

<script setup lang="ts">
import BaseContainer from "@components/base/BaseContainer.vue";
import BaseToolbar from "@components/base/BaseToolbar.vue";
import StudyCardSkeleton from "@components/studies/StudyCardSkeleton.vue";
import StudyList from "@components/studies/StudyList.vue";
import { navigationItems } from "@data/navigationItems";
import { Plus, Search } from "@lucide/vue";
import { useBreadcrumbs } from "@stores/useBreadcrumbs";
import { ref } from "vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const search = ref("");

const { setBreadcrumbs } = useBreadcrumbs();
setBreadcrumbs([navigationItems.studies]);
</script>
