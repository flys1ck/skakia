<template>
  <div
    class="linux:from-rose-300 linux:via-fuchsia-300 linux:to-violet-300 flex h-screen overflow-hidden bg-linear-to-b/srgb from-rose-300/92 via-fuchsia-300/72 via-50% to-violet-300/55"
  >
    <NavigationSidebar />
    <main class="flex min-w-0 grow flex-col overflow-y-auto pr-1.5 pb-1.5">
      <div class="flex min-h-0 min-w-0 grow flex-col">
        <header data-tauri-drag-region class="flex h-12 shrink-0 items-center gap-3 pr-3 pl-4">
          <template v-if="studyOrigin.returnLink">
            <Button variant="outline" size="sm" class="shrink-0" as-child>
              <RouterLink :to="studyOrigin.returnLink.to">
                <ArrowLeft data-icon="inline-start" />
                {{ studyOrigin.returnLink.label }}
              </RouterLink>
            </Button>
            <Separator orientation="vertical" class="mx-2" />
          </template>
          <Breadcrumb>
            <BreadcrumbList>
              <template v-for="(breadcrumb, i) in breadcrumbsStore.breadcrumbs" :key="breadcrumb.name">
                <BreadcrumbSeparator v-if="i !== 0" />
                <BreadcrumbItem>
                  <BreadcrumbPage v-if="i === breadcrumbsStore.breadcrumbs.length - 1" class="flex items-center gap-2">
                    <Component v-if="breadcrumb.icon" :is="breadcrumb.icon" class="size-5 shrink-0" />
                    {{ breadcrumb.name }}
                  </BreadcrumbPage>
                  <BreadcrumbLink v-else as-child>
                    <RouterLink :to="breadcrumb.to" class="flex items-center gap-2">
                      <Component v-if="breadcrumb.icon" :is="breadcrumb.icon" class="size-5 shrink-0" />
                      {{ breadcrumb.name }}
                    </RouterLink>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </template>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <h1 class="sr-only" aria-live="polite">{{ breadcrumbsStore.breadcrumbs.at(-1)?.name }}</h1>
        <!--
          Suspense must stay inside RouterView: around it, Vue holds back RouterView updates while an async page is pending, and a page that fails to load blocks navigation.
          timeout="0" unmounts the previous page right away: kept alive, its route param watchers would fire with the next route's params.
        -->
        <div class="bg-background flex min-h-0 grow flex-col overflow-y-auto rounded-xl border">
          <RouterView v-slot="{ Component: page }">
            <Suspense v-if="page" :timeout="0">
              <Component :is="page" />
            </Suspense>
          </RouterView>
        </div>
      </div>
    </main>
    <SettingsDialog />
  </div>
</template>

<script setup lang="ts">
import NavigationSidebar from "@components/NavigationSidebar.vue";
import SettingsDialog from "@components/settings/SettingsDialog.vue";
import { ArrowLeft } from "@lucide/vue";
import { useBreadcrumbs } from "@stores/useBreadcrumbs";
import { useStudyOrigin } from "@stores/useStudyOrigin";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const breadcrumbsStore = useBreadcrumbs();
const studyOrigin = useStudyOrigin();
</script>
