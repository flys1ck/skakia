import { describe, expect, it } from "vitest";
import { cleanAuthors, formatAuthor, parseAnnotator, parseAuthor, toKnownAuthor } from "./studyAuthors";

describe("parseAnnotator", () => {
  it("reads a leading FIDE title", () => {
    expect(parseAnnotator("GM Mark Dvoretsky")).toEqual([{ name: "Mark Dvoretsky", title: "GM" }]);
    expect(parseAnnotator("WIM. Anna Rudolf")).toEqual([{ name: "Anna Rudolf", title: "WIM" }]);
  });

  it("splits several authors", () => {
    expect(parseAnnotator("GM Mark Dvoretsky, IM Artur Yusupov & Max and Moritz; Anderssen")).toEqual([
      { name: "Mark Dvoretsky", title: "GM" },
      { name: "Artur Yusupov", title: "IM" },
      { name: "Max", title: null },
      { name: "Moritz", title: null },
      { name: "Anderssen", title: null },
    ]);
  });

  it("keeps names that only start like a title", () => {
    expect(parseAnnotator("Gmitruk")).toEqual([{ name: "Gmitruk", title: null }]);
    expect(parseAnnotator("gm magnus")).toEqual([{ name: "gm magnus", title: null }]);
    expect(parseAnnotator("GM")).toEqual([{ name: "GM", title: null }]);
  });

  it("turns a Lichess profile URL into the username and drops other URLs", () => {
    expect(parseAnnotator("https://lichess.org/@/thibault")).toEqual([{ name: "thibault", title: null }]);
    expect(parseAnnotator("https://example.com/annotations")).toEqual([]);
  });

  it("ignores empty and unknown annotators", () => {
    expect(parseAnnotator("")).toEqual([]);
    expect(parseAnnotator("?")).toEqual([]);
  });
});

describe("cleanAuthors", () => {
  it("trims names and drops empty rows", () => {
    expect(
      cleanAuthors([
        { name: "  Mark Dvoretsky ", title: "GM" },
        { name: "   ", title: "IM" },
      ])
    ).toEqual([{ name: "Mark Dvoretsky", title: "GM" }]);
  });
});

describe("parseAuthor", () => {
  it("reads a leading title from free text", () => {
    expect(parseAuthor("  IM John Bartholomew ")).toEqual({ name: "John Bartholomew", title: "IM" });
    expect(parseAuthor("Judit Polgar")).toEqual({ name: "Judit Polgar", title: null });
  });
});

describe("formatAuthor", () => {
  it("puts the title before the name", () => {
    expect(formatAuthor({ name: "Mark Dvoretsky", title: "GM" })).toBe("GM Mark Dvoretsky");
    expect(formatAuthor({ name: "Max", title: null })).toBe("Max");
  });
});

describe("toKnownAuthor", () => {
  const knownAuthors = [{ name: "Daniel Naroditsky", title: "GM" as const }];

  it("takes the known spelling and title", () => {
    expect(toKnownAuthor({ name: "daniel naroditsky", title: "IM" }, knownAuthors)).toEqual(knownAuthors[0]);
  });

  it("keeps an unknown author", () => {
    expect(toKnownAuthor({ name: "Judit Polgar", title: null }, knownAuthors)).toEqual({
      name: "Judit Polgar",
      title: null,
    });
  });
});
