import { describe, expect, it } from "vitest";
import { extractChessDotComLiveGameId, isChessDotComGameFinished } from "./chessdotcom";

function documentWith(element: object | null): Document {
  return { querySelector: () => element } as unknown as Document;
}

describe("extractChessDotComLiveGameId", () => {
  it.each([
    ["/game/171614746182", "171614746182"],
    ["/game/live/171614746182", "171614746182"],
    ["/game/171614746182/", "171614746182"],
    ["/analysis/game/live/171614746182", "171614746182"],
    ["/analysis/game/live/171614746182/review", "171614746182"],
  ])("reads the game id from %s", (pathname, gameId) => {
    expect(extractChessDotComLiveGameId(pathname)).toBe(gameId);
  });

  it.each(["/", "/play/online", "/game/daily/123", "/analysis/game/daily/123", "/game/computer/123", "/analysis"])(
    "ignores %s",
    (pathname) => {
      expect(extractChessDotComLiveGameId(pathname)).toBeNull();
    }
  );
});

describe("isChessDotComGameFinished", () => {
  it("is true on an analysis URL without any marker", () => {
    expect(isChessDotComGameFinished(documentWith(null), { pathname: "/analysis/game/live/123" })).toBe(true);
  });

  it("is true on a game URL once the finished-game UI is present", () => {
    expect(isChessDotComGameFinished(documentWith({}), { pathname: "/game/123" })).toBe(true);
  });

  it("is false on a game URL while the game is being played", () => {
    expect(isChessDotComGameFinished(documentWith(null), { pathname: "/game/123" })).toBe(false);
  });
});
