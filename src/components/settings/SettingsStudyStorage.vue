<template>
  <SettingsGroup heading="Database Size">
    <template #description> Space each study takes up in the local database. Per-study values are estimates. </template>
    <Suspense>
      <StudyStorageChart />
      <template #fallback>
        <div class="space-y-4" aria-label="Loading study storage">
          <Skeleton class="h-5" />
          <div v-for="index in 3" :key="index" class="space-y-2">
            <Skeleton class="h-4 w-1/3" />
            <Skeleton class="h-2 rounded-full" />
          </div>
        </div>
      </template>
    </Suspense>
  </SettingsGroup>
</template>

<script setup lang="ts">
import SettingsGroup from "@components/settings/SettingsGroup.vue";
import StudyStorageChart from "@components/settings/StudyStorageChart.vue";
import { Skeleton } from "@/components/ui/skeleton";
</script>
