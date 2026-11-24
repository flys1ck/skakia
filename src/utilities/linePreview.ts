import { INITIAL_FEN } from "chessops/fen";

export interface LineMoves {
  moves: string;
  startFen?: string | null;
  name?: string;
}

const SAN = /^(?:[KQRBN]?[a-h]?[1-8]?x?[a-h][1-8](?:=[QRBN])?|O-O(?:-O)?)$/;
const NUMBERED_MOVE = /^(\d+)(\.{3}|…|\.)(.+)$/;
const TRAILING_ANNOTATIONS = /[+#!?]+$/;

/**
 * Counts the plies up to the last move that a line's name mentions, e.g. 13 for "4.dxc5 Nc6 5.Nf3 Bg4 6.Bb5 e6 with
 * 7.Be3". Moves the line does not play, like the alternatives in "4.Nc3/4.Be3/4.f4", are skipped.
 */
export function countNamedPlies(name: string, sanMoves: string[], startPly = 0): number {
  const tokens = name
    .replace(/(\d+)\s*(\.{3}|…|\.)\s+/g, "$1$2")
    .split(/[\s(),/&]+/)
    .filter(Boolean);
  let namedPlies = 0;
  // A move without a number continues from the previous token, so only when that one was a move this line plays
  let previousPly: number | undefined;
  for (const token of tokens) {
    const numbered = NUMBERED_MOVE.exec(token);
    const san = (numbered ? numbered[3] : token).replace(TRAILING_ANNOTATIONS, "");
    let ply: number | undefined;
    if (numbered && SAN.test(san)) ply = (Number(numbered[1]) - 1) * 2 + (numbered[2] === "." ? 0 : 1);
    else if (previousPly !== undefined && SAN.test(san)) ply = previousPly + 1;

    const index = ply === undefined ? -1 : ply - startPly;
    const isPlayed = index >= 0 && sanMoves[index]?.replace(TRAILING_ANNOTATIONS, "") === san;
    if (isPlayed) namedPlies = Math.max(namedPlies, index + 1);
    previousPly = isPlayed ? ply : undefined;
  }
  return namedPlies;
}

export function getStartPly(fen: string): number {
  const [, turn, , , , fullmoves] = fen.split(" ");
  return ((Number(fullmoves) || 1) - 1) * 2 + (turn === "b" ? 1 : 0);
}

export function formatSanMoves(sanMoves: string[], startPly = 0): string {
  return sanMoves
    .map((san, i) => {
      const ply = startPly + i;
      const moveNumber = Math.floor(ply / 2) + 1;
      if (ply % 2 === 0) return `${moveNumber}.${san}`;
      return i === 0 ? `${moveNumber}...${san}` : san;
    })
    .join(" ");
}

function countCommonPlies(lines: string[][]): number {
  if (lines.length < 2) return 0;
  const shortest = Math.min(...lines.map((line) => line.length));
  let plies = 0;
  while (plies < shortest && lines.every((line) => line[plies] === lines[0][plies])) plies++;
  return plies;
}

/**
 * Formats each line's moves with move numbers, leaving out the opening moves that all lines of a chapter share and the
 * moves the line's name already spells out, so the preview shows where the lines differ. Lines from a custom start
 * position are numbered from that position.
 */
export function getLinePreviews(lines: LineMoves[]): string[] {
  const parsed = lines.map((line) => ({
    sanMoves: line.moves.split(/\s+/).filter(Boolean),
    startFen: line.startFen && line.startFen !== INITIAL_FEN ? line.startFen : undefined,
    name: line.name ?? "",
  }));
  const commonPlies = countCommonPlies(
    parsed.filter((line) => !line.startFen && line.sanMoves.length).map((line) => line.sanMoves)
  );

  return parsed.map(({ sanMoves, startFen, name }) => {
    const startPly = startFen ? getStartPly(startFen) : 0;
    const skippedPlies = Math.max(startFen ? 0 : commonPlies, countNamedPlies(name, sanMoves, startPly));
    return formatSanMoves(sanMoves.slice(skippedPlies), startPly + skippedPlies);
  });
}
