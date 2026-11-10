import { useExtensionPromo } from "@stores/useExtensionPromo";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Router } from "vue-router";
import { initDeepLinks, parseAppDeepLink, parseOAuthCallback } from "./deepLinks";

type UrlHandler = (urls: string[]) => Promise<void>;

const deepLink = vi.hoisted(() => ({
  launchUrls: null as string[] | null,
  handler: undefined as UrlHandler | undefined,
}));

vi.mock("@tauri-apps/plugin-deep-link", () => ({
  getCurrent: vi.fn<() => Promise<string[] | null>>(async () => deepLink.launchUrls),
  onOpenUrl: vi.fn<(handler: UrlHandler) => Promise<() => void>>(async (handler) => {
    deepLink.handler = handler;
    return () => (deepLink.handler = undefined);
  }),
}));

const GAME_LINK = "com.skakia.app://games/lichess?id=9SZSSje9";
const OAUTH_LINK = "com.skakia.app://oauth/callback?code=abc&state=xyz";

describe("initDeepLinks", () => {
  const push = vi.fn<(path: string) => Promise<void>>(async () => {});
  const router = { push } as unknown as Router;

  beforeEach(() => {
    setActivePinia(createPinia());
    push.mockClear();
    deepLink.launchUrls = null;
    deepLink.handler = undefined;
  });

  it("opens the game the app was launched with and remembers that the extension is in use", async () => {
    deepLink.launchUrls = [GAME_LINK];

    await initDeepLinks(router);

    expect(push).toHaveBeenCalledWith("/games/lichess/9SZSSje9");
    expect(useExtensionPromo().hasOpenedGameLink).toBe(true);
  });

  it("opens a game link that arrives while the app is running", async () => {
    await initDeepLinks(router);
    expect(useExtensionPromo().hasOpenedGameLink).toBe(false);

    await deepLink.handler?.([GAME_LINK]);

    expect(push).toHaveBeenCalledWith("/games/lichess/9SZSSje9");
    expect(useExtensionPromo().hasOpenedGameLink).toBe(true);
  });

  it("does not count an OAuth callback as a game link", async () => {
    await initDeepLinks(router);

    await deepLink.handler?.([OAUTH_LINK]);

    expect(push).not.toHaveBeenCalled();
    expect(useExtensionPromo().hasOpenedGameLink).toBe(false);
  });
});

describe("parseOAuthCallback", () => {
  it("reads query params from a Lichess OAuth callback", () => {
    expect(parseOAuthCallback("com.skakia.app://oauth/callback?code=abc&state=xyz")?.get("code")).toBe("abc");
  });

  it("ignores game deep links", () => {
    expect(parseOAuthCallback("com.skakia.app://games/lichess?id=9SZSSje9")).toBeNull();
  });
});

describe("parseAppDeepLink", () => {
  it("maps a finished Lichess game deep link to the game route", () => {
    expect(parseAppDeepLink("com.skakia.app://games/lichess?id=9SZSSje9")).toBe("/games/lichess/9SZSSje9");
  });

  it("maps a finished Chess.com game deep link to the game route", () => {
    expect(parseAppDeepLink("com.skakia.app://games/chessdotcom?id=171614746182")).toBe(
      "/games/chessdotcom/171614746182"
    );
  });

  it("ignores oauth callbacks", () => {
    expect(parseAppDeepLink("com.skakia.app://oauth/callback?code=abc")).toBeNull();
  });

  it("ignores generic open links", () => {
    expect(parseAppDeepLink("com.skakia.app://open")).toBeNull();
  });

  it("rejects game links without an id", () => {
    expect(parseAppDeepLink("com.skakia.app://games/lichess")).toBeNull();
    expect(parseAppDeepLink("com.skakia.app://games/chessdotcom")).toBeNull();
  });
});
