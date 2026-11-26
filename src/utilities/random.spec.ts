import { describe, expect, it } from "vitest";
import { createSeededRandom } from "./random";

describe("createSeededRandom", () => {
  it("yields the same numbers for the same text", () => {
    const first = createSeededRandom("The Iron English");
    const second = createSeededRandom("The Iron English");
    expect(Array.from({ length: 5 }, first)).toEqual(Array.from({ length: 5 }, second));
  });

  it("yields different numbers for different text", () => {
    expect(createSeededRandom("Caro-Kann")()).not.toBe(createSeededRandom("Classical Slav")());
  });

  it("stays within [0, 1)", () => {
    const random = createSeededRandom("");
    for (let i = 0; i < 1000; i++) {
      const value = random();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});
