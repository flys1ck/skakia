import { describe, expect, it } from "vitest";
import { createSeededRandom } from "./random";
import { assignCollectorNumbers, assignCoverStyles, COVER_HUES, COVER_PIECES } from "./studyCover";

const preferredHue = (name: string) => COVER_HUES[Math.floor(createSeededRandom(name)() * COVER_HUES.length)];
const studiesNamed = (name: string, count: number) => Array.from({ length: count }, (_, i) => ({ id: i + 1, name }));

describe("assignCoverStyles", () => {
  it("gives a study the hue its name picks", () => {
    const styles = assignCoverStyles([{ id: 1, name: "The Iron English" }]);
    expect(styles.get(1)?.hue).toBe(preferredHue("The Iron English"));
  });

  it("moves a newer study with the same name to the next free hue and piece", () => {
    const styles = assignCoverStyles(studiesNamed("Caro-Kann", 2).reverse());
    const first = styles.get(1)!;
    const second = styles.get(2)!;
    expect(second.hue).toBe(COVER_HUES[(COVER_HUES.indexOf(first.hue) + 1) % COVER_HUES.length]);
    expect(second.piece).toBe(COVER_PIECES[(COVER_PIECES.indexOf(first.piece) + 1) % COVER_PIECES.length]);
  });

  it("keeps older studies' styles when a study is added", () => {
    const studies = [
      { id: 1, name: "Caro-Kann" },
      { id: 2, name: "London System" },
      { id: 3, name: "Iron English" },
    ];
    const before = assignCoverStyles(studies);
    const after = assignCoverStyles([...studies, { id: 4, name: "Caro-Kann" }]);
    for (const { id } of studies) expect(after.get(id)).toEqual(before.get(id));
  });

  it("uses every hue and piece equally often", () => {
    const count = COVER_HUES.length * COVER_PIECES.length * 2;
    const styles = [...assignCoverStyles(studiesNamed("Same", count)).values()];
    for (const hue of COVER_HUES)
      expect(styles.filter((style) => style.hue === hue)).toHaveLength(count / COVER_HUES.length);
    for (const piece of COVER_PIECES) {
      expect(styles.filter((style) => style.piece === piece)).toHaveLength(count / COVER_PIECES.length);
    }
  });
});

describe("assignCollectorNumbers", () => {
  it("numbers studies in the order given out of the total", () => {
    const numbers = assignCollectorNumbers([{ id: 7 }, { id: 2 }, { id: 5 }]);
    expect([...numbers]).toEqual([
      [7, "001/003"],
      [2, "002/003"],
      [5, "003/003"],
    ]);
  });

  it("widens the number past three digits when the total needs it", () => {
    const numbers = assignCollectorNumbers(Array.from({ length: 1200 }, (_, i) => ({ id: i + 1 })));
    expect(numbers.get(1)).toBe("0001/1200");
  });
});
