<template>
  <div class="flex min-h-0 grow overflow-hidden">
    <!-- v-show keeps expanded chapters and their loaded lines while the panel is hidden -->
    <StudyWorkspacePanel
      v-show="isPanelOpen"
      class="w-60 shrink-0 border-r xl:w-72"
      :study-id="studyId"
      :chapter-id="chapterId"
      :line-id="lineId"
      @collapse="isPanelOpen = false"
    />
    <div v-if="!isPanelOpen" class="shrink-0 border-r p-1.5">
      <Tooltip>
        <TooltipTrigger as-child>
          <Button size="icon-sm" variant="ghost" aria-label="Show chapters" @click="isPanelOpen = true">
            <PanelLeftOpen />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">Show chapters</TooltipContent>
      </Tooltip>
    </div>
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import StudyWorkspacePanel from "@components/studies/StudyWorkspacePanel.vue";
import { PanelLeftOpen } from "@lucide/vue";
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const route = useRoute("/studies/[studyId]/(workspace)");
const studyId = computed(() => Number(route.params.studyId));
const chapterId = computed(() => ("chapterId" in route.params ? Number(route.params.chapterId) : undefined));
const lineId = computed(() => ("lineId" in route.params ? Number(route.params.lineId) : undefined));
const isPanelOpen = ref(true);
</script>
