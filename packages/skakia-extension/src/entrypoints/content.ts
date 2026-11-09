import { defineContentScript } from "wxt/utils/define-content-script";
import { startFloatingButtonSync, stopFloatingButtonSync } from "@/content/floating-button";

export default defineContentScript({
  matches: ["https://lichess.org/*", "https://www.chess.com/*"],
  main(ctx) {
    startFloatingButtonSync();
    ctx.onInvalidated(stopFloatingButtonSync);
  },
});
