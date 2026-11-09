/**
 * Matches `/gameId`, `/gameIdXXXX` (player seat), and optional `/white|black|/analysis` suffixes. `/analysis` itself is
 * excluded: the standalone board is 8 characters long and renders the same `main.analyse` as a game.
 */
const LICHESS_GAME_PATH =
  /^\/(?!analysis(?:\/|$))([a-zA-Z0-9]{8})([a-zA-Z0-9]{4})?(?:\/(?:white|black))?(?:\/analysis)?\/?$/;

/**
 * Other 8-character routes (`/training`, `/practice`, `/streamer`, ...) match the path as well, so the page also has to
 * render a game.
 */
const LICHESS_GAME_PAGE_SELECTOR = "main.round, main.analyse";

/**
 * Result markers for finished Lichess games: `section.status` (SSR/sidebar), `.result-wrap` / `p.result` (round),
 * `div.result` (analysis).
 */
const LICHESS_FINISHED_SELECTORS = "section.status, .result-wrap, p.result, div.result";

/**
 * Returns the 8-char Lichess game id from a pathname, or null if the path or the page is not a game.
 */
export function extractLichessGameId(pathname: string, doc: Document = document): string | null {
  if (!doc.querySelector(LICHESS_GAME_PAGE_SELECTOR)) return null;

  return pathname.match(LICHESS_GAME_PATH)?.[1] ?? null;
}

/**
 * Returns true when the document shows a finished-game result.
 */
export function isLichessGameFinished(doc: Document = document): boolean {
  return Boolean(doc.querySelector(LICHESS_FINISHED_SELECTORS));
}
