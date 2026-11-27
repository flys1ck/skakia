<template>
  <Accordion type="multiple" :default-value="['study-moves', 'study-lines', 'master-moves']" class="overflow-y-auto">
    <ExplorerSection
      value="study-moves"
      heading="Study moves"
      :count="studies ? pluralize(studies.moves.length, 'move') : undefined"
    >
      <div v-if="!studies" class="flex flex-col gap-2 px-4 py-1">
        <Skeleton v-for="i in 3" :key="i" class="h-5" />
      </div>
      <ul v-else-if="studies.moves.length" class="divide-y">
        <li v-for="move in studies.moves" :key="`${move.source}-${move.destination}-${move.san}`">
          <ExplorerMoveRow :game="game" :orig="move.source as Key" :dest="move.destination as Key">
            <span class="font-medium">{{ move.san }}</span>
            <span class="text-muted-foreground ml-auto text-xs">{{ pluralize(move.line_count, "line") }}</span>
          </ExplorerMoveRow>
        </li>
      </ul>
      <p v-else class="text-muted-foreground px-4 py-1 text-sm">This position isn't in your studies yet.</p>
    </ExplorerSection>

    <ExplorerSection
      v-if="studies?.lineTotal"
      value="study-lines"
      heading="Study lines"
      :count="pluralize(studies.lineTotal, 'line')"
    >
      <div v-for="chapter in linesByChapter" :key="chapter.id" class="not-first:border-t">
        <h4
          class="bg-muted flex items-baseline gap-1 border-b px-4 py-1 text-xs whitespace-nowrap"
          :title="`${chapter.studyName} › ${chapter.name}`"
        >
          <!-- The study name repeats across its chapters, so it gives up its space first -->
          <span class="text-muted-foreground min-w-14 truncate">{{ chapter.studyName }}</span>
          <span class="text-muted-foreground shrink-0">›</span>
          <span class="max-w-[calc(100%-4.75rem)] shrink-0 truncate font-medium">{{ chapter.name }}</span>
        </h4>
        <ul class="divide-y">
          <li v-for="line in chapter.lines" :key="line.line_id">
            <RouterLink
              :to="`/studies/${line.study_id}/chapters/${line.chapter_id}/lines/${line.line_id}/#${encodeURIComponent(line.position_key)}`"
              class="hover:bg-primary/15 block truncate px-4 py-1 text-sm"
              :title="line.line_name"
              @pointermove="
                () =>
                  game.setAutoShapes(
                    [{ brush: 'paleBlue', orig: line.source as Key, dest: line.destination as Key }],
                    'temporary'
                  )
              "
              @pointerleave="() => game.setAutoShapes([], 'temporary')"
              @click="
                () => {
                  studyOrigin.rememberOrigin(game);
                  $emit('lineClick');
                }
              "
            >
              {{ line.line_name }}
            </RouterLink>
          </li>
        </ul>
      </div>
    </ExplorerSection>

    <ExplorerSection
      value="master-moves"
      heading="Master moves"
      :count="masters ? pluralize(masterMoves.length, 'move') : undefined"
    >
      <div v-if="mastersPending" class="flex flex-col gap-2 px-4 py-1">
        <Skeleton v-for="i in 3" :key="i" class="h-5" />
      </div>
      <div v-else-if="mastersError" class="flex items-center justify-between gap-2 px-4 py-1">
        <p class="text-muted-foreground text-sm">Couldn't load the masters database.</p>
        <Button variant="outline" size="xs" @click="refetchMasters()">Retry</Button>
      </div>
      <ul v-else-if="masterMoves.length" class="divide-y">
        <li v-for="move in masterMoves" :key="move.uci">
          <ExplorerMoveRow :game="game" :orig="move.uci.substring(0, 2) as Key" :dest="move.uci.substring(2, 4) as Key">
            <span class="w-10 shrink-0 font-medium">{{ move.san }}</span>
            <span class="text-muted-foreground w-9 shrink-0 text-right text-xs tabular-nums">
              {{ move.playPercentage }}%
            </span>
            <span class="flex h-4 min-w-0 grow overflow-hidden rounded-sm border text-center text-xs leading-4">
              <span
                v-if="move.whiteWinPercentage"
                class="bg-white text-mauve-950"
                :style="`width: ${move.whiteWinPercentage}%`"
              >
                {{ percentageText(move.whiteWinPercentage) }}
              </span>
              <span
                v-if="move.drawPercentage"
                class="bg-mauve-300 text-mauve-800"
                :style="`width: ${move.drawPercentage}%`"
              >
                {{ percentageText(move.drawPercentage) }}
              </span>
              <span v-if="move.blackWinPercentage" class="grow bg-mauve-800 text-mauve-50">
                {{ percentageText(move.blackWinPercentage) }}
              </span>
            </span>
          </ExplorerMoveRow>
        </li>
      </ul>
      <p v-else class="text-muted-foreground px-4 py-1 text-sm">No master games reached this position.</p>
    </ExplorerSection>

    <ExplorerSection
      v-if="masterGames.length"
      value="master-games"
      heading="Master games"
      :count="pluralize(masterGameTotal, 'game', true)"
    >
      <ul class="divide-y">
        <li v-for="topGame in masterGames" :key="topGame.id">
          <ExplorerMoveRow
            :game="game"
            :orig="topGame.uci.substring(0, 2) as Key"
            :dest="topGame.uci.substring(2, 4) as Key"
          >
            <span class="flex min-w-0 grow flex-col">
              <span class="truncate">
                {{ topGame.white.name }} <span class="text-muted-foreground text-xs">{{ topGame.white.rating }}</span>
              </span>
              <span class="truncate">
                {{ topGame.black.name }} <span class="text-muted-foreground text-xs">{{ topGame.black.rating }}</span>
              </span>
            </span>
            <GameResultTag :result="topGame.winner" />
            <span class="text-muted-foreground w-14 shrink-0 text-right text-xs">{{
              topGame.month ?? topGame.year
            }}</span>
          </ExplorerMoveRow>
        </li>
      </ul>
    </ExplorerSection>
  </Accordion>
</template>

<script setup lang="ts">
import ExplorerMoveRow from "@components/sidebar/ExplorerMoveRow.vue";
import ExplorerSection from "@components/sidebar/ExplorerSection.vue";
import GameResultTag from "@components/sidebar/GameResultTag.vue";
import { useGame } from "@composables/useGame";
import { explorerClient, mastersDatabase, type OpeningExplorerMasters } from "@flys1ck/lichess-client";
import { Key } from "@lichess-org/chessground/types";
import { db, select, selectFirst } from "@services/database";
import { useStudyOrigin } from "@stores/useStudyOrigin";
import { keepPreviousData, useQuery } from "@tanstack/vue-query";
import { roundToFixed } from "@utilities/math";
import { getPositionKey } from "@utilities/move";
import type { Selectable } from "kysely";
import { computed } from "vue";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Chapters, ChessPositions, Lines, Positions, Studies } from "@/database";

type MoveStatistics = {
  moveTotal: number;
  playPercentage: number;
  whiteWinPercentage: number;
  blackWinPercentage: number;
  drawPercentage: number;
};
type StudyMoveInPosition = Pick<Selectable<Positions>, "source" | "destination" | "san"> & {
  line_count: number;
};
type StudyLineWithPosition = Pick<Selectable<Positions>, "source" | "destination"> & {
  position_key: Selectable<ChessPositions>["position_key"];
  study_id: Selectable<Studies>["id"];
  study_name: Selectable<Studies>["name"];
  chapter_id: Selectable<Chapters>["id"];
  chapter_name: Selectable<Chapters>["name"];
  line_id: Selectable<Lines>["id"];
  line_name: Selectable<Lines>["name"];
};

const LINE_LIMIT = 10;

const props = defineProps<{
  game: ReturnType<typeof useGame>;
}>();
defineEmits<{
  lineClick: [];
}>();

const studyOrigin = useStudyOrigin();

const fen = computed(() => props.game.fen.value);
const positionKey = computed(() => getPositionKey(fen.value));

const { data: studies } = useQuery({
  queryKey: ["studies", "explorer", positionKey],
  queryFn: async () => {
    const positionsWithKey = db
      .selectFrom("positions")
      .innerJoin("chess_positions", "chess_positions.id", "positions.chess_position")
      .where("chess_positions.position_key", "=", positionKey.value);

    const movesQuery = positionsWithKey
      .select(({ fn }) => ["source", "destination", "san", fn.count<number>("line").distinct().as("line_count")])
      .groupBy(["source", "destination", "san"])
      .orderBy("line_count", "desc")
      .compile();
    const lineTotalQuery = positionsWithKey
      .select(({ fn }) => fn.count<number>("line").distinct().as("total"))
      .compile();
    const linesQuery = positionsWithKey
      .innerJoin("lines", "lines.id", "positions.line")
      .innerJoin("chapters", "chapters.id", "lines.chapter")
      .innerJoin("studies", "studies.id", "chapters.study")
      .select([
        "positions.source",
        "positions.destination",
        "chess_positions.position_key",
        "studies.id as study_id",
        "studies.name as study_name",
        "chapters.id as chapter_id",
        "chapters.name as chapter_name",
        "lines.id as line_id",
        "lines.name as line_name",
      ])
      // A line can play several moves from this position once its sidelines are indexed
      .groupBy("lines.id")
      .orderBy("studies.name")
      .orderBy("chapters.id")
      .orderBy("lines.id")
      .limit(LINE_LIMIT)
      .compile();

    const [moves, lineTotal, lines] = await Promise.all([
      select(movesQuery),
      selectFirst(lineTotalQuery),
      select(linesQuery),
    ]);
    return { moves, lines, lineTotal: lineTotal?.total ?? 0 };
  },
  placeholderData: keepPreviousData,
});

const linesByChapter = computed(() => {
  const chapters = new Map<number, { id: number; name: string; studyName: string; lines: StudyLineWithPosition[] }>();
  for (const line of studies.value?.lines ?? []) {
    const chapter = chapters.get(line.chapter_id) ?? {
      id: line.chapter_id,
      name: line.chapter_name,
      studyName: line.study_name,
      lines: [],
    };
    chapter.lines.push(line);
    chapters.set(line.chapter_id, chapter);
  }
  return [...chapters.values()];
});

const {
  data: masters,
  isPending: mastersPending,
  isError: mastersError,
  refetch: refetchMasters,
} = useQuery({
  queryKey: ["lichess", "masters", fen],
  queryFn: async ({ signal }) => {
    const { data, error } = await mastersDatabase({
      client: explorerClient,
      query: { fen: fen.value, topGames: 10 },
      signal,
    });
    if (error || !data) throw new Error("Failed to load masters database");
    return data;
  },
  staleTime: Infinity,
  placeholderData: keepPreviousData,
});
const masterGames = computed(() => masters.value?.topGames ?? []);
const masterGameTotal = computed(() =>
  masters.value ? masters.value.white + masters.value.black + masters.value.draws : 0
);
const masterMoves = computed(() =>
  (masters.value?.moves ?? []).map((move) => ({ ...move, ...getMoveStatistics(move, masterGameTotal.value) }))
);

const compactNumber = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });

function pluralize(count: number, noun: string, compact = false) {
  const amount = compact ? compactNumber.format(count) : count;
  return `${amount} ${noun}${count === 1 ? "" : "s"}`;
}

function getMoveStatistics(move: OpeningExplorerMasters["moves"][number], totalMasterMoves: number): MoveStatistics {
  const moveTotal = roundToFixed(move.white + move.black + move.draws, 0);
  const playPercentage = roundToFixed((moveTotal * 100) / totalMasterMoves, 0);
  const whiteWinPercentage = roundToFixed((move.white * 100) / moveTotal, 0);
  const blackWinPercentage = roundToFixed((move.black * 100) / moveTotal, 0);
  const drawPercentage = roundToFixed((move.draws * 100) / moveTotal, 0);

  return {
    moveTotal,
    playPercentage,
    whiteWinPercentage,
    blackWinPercentage,
    drawPercentage,
  };
}

function percentageText(percentage: number) {
  if (percentage < 10) return "";
  else if (percentage <= 20) return `${percentage}`;
  else return `${percentage}%`;
}
</script>
