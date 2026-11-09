import { describe, expect, it } from "vitest";
import { extractLichessGameId, isLichessGameFinished } from "./lichess";

function documentMatching(...present: string[]): Document {
  return {
    querySelector: (selectors: string) => (selectors.split(", ").some((s) => present.includes(s)) ? {} : null),
  } as unknown as Document;
}

describe("extractLichessGameId", () => {
  const roundPage = documentMatching("main.round");

  it.each([
    ["/9SZSSje9", "9SZSSje9"],
    ["/9SZSSje9/", "9SZSSje9"],
    ["/9SZSSje9/black", "9SZSSje9"],
    ["/9SZSSje9abcd", "9SZSSje9"],
    ["/9SZSSje9/analysis", "9SZSSje9"],
    ["/analysisAbCd", "analysis"],
  ])("reads the game id from %s", (pathname, gameId) => {
    expect(extractLichessGameId(pathname, roundPage)).toBe(gameId);
  });

  it.each(["/", "/tournament", "/analysis/standard", "/training/daily", "/tv/rapid", "/@/someuser"])(
    "ignores %s",
    (pathname) => {
      expect(extractLichessGameId(pathname, roundPage)).toBeNull();
    }
  );

  it.each(["/analysis", "/analysis/"])("ignores the standalone analysis board at %s", (pathname) => {
    expect(extractLichessGameId(pathname, documentMatching("main.analyse"))).toBeNull();
  });

  it.each(["/training", "/practice", "/streamer", "/features"])(
    "ignores the 8-character route %s when the page is not a game",
    (pathname) => {
      expect(extractLichessGameId(pathname, documentMatching())).toBeNull();
    }
  );

  it("reads the game id on an analysis page", () => {
    expect(extractLichessGameId("/9SZSSje9", documentMatching("main.analyse"))).toBe("9SZSSje9");
  });
});

describe("isLichessGameFinished", () => {
  it.each(["section.status", ".result-wrap", "p.result", "div.result"])("is true when %s is present", (selector) => {
    expect(isLichessGameFinished(documentMatching(selector))).toBe(true);
  });

  it("is false without a result marker", () => {
    expect(isLichessGameFinished(documentMatching("main.round"))).toBe(false);
  });
});
