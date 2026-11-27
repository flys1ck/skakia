import { createSeededRandom } from "./random";

// Spaced 35–45° apart, because closer hues look the same on such light pastels.
export const COVER_HUES = [15, 55, 95, 135, 170, 210, 250, 290, 330];
export const COVER_PIECES = ["k", "q", "r", "b", "n", "p"] as const;

export interface StudyCoverStyle {
  hue: number;
  piece: (typeof COVER_PIECES)[number];
}

/**
 * Gives every study the option its seed text picks, or the next free one if an older study already has it, so older
 * studies keep theirs when new ones are added. Options repeat only once all of them are taken, so each is used about
 * equally often.
 */
function assignDistinct<T>(studies: { id: number; name: string }[], options: readonly T[], salt: string) {
  const assigned = new Map<number, T>();
  const taken = new Set<number>();
  for (const study of studies.toSorted((a, b) => a.id - b.id)) {
    if (taken.size === options.length) taken.clear();
    let index = Math.floor(createSeededRandom(study.name + salt)() * options.length);
    while (taken.has(index)) index = (index + 1) % options.length;
    taken.add(index);
    assigned.set(study.id, options[index]);
  }
  return assigned;
}

export function coverColors(hue: number) {
  return {
    background: `oklch(0.93 0.035 ${hue})`,
    tint: `oklch(0.8 0.07 ${hue})`,
    ink: `oklch(0.6 0.07 ${hue})`,
  };
}

export function assignCoverStyles(studies: { id: number; name: string }[]): Map<number, StudyCoverStyle> {
  // The hue uses the name alone, which keeps the colors studies already have.
  const hues = assignDistinct(studies, COVER_HUES, "");
  const pieces = assignDistinct(studies, COVER_PIECES, "\npiece");
  return new Map(studies.map((study) => [study.id, { hue: hues.get(study.id)!, piece: pieces.get(study.id)! }]));
}

/**
 * Numbers studies in the order given out of the total, like `007/024`, so removing one renumbers the later ones.
 */
export function assignCollectorNumbers(studies: { id: number }[]): Map<number, string> {
  const digits = Math.max(3, String(studies.length).length);
  const total = String(studies.length).padStart(digits, "0");
  return new Map(studies.map((study, index) => [study.id, `${String(index + 1).padStart(digits, "0")}/${total}`]));
}
