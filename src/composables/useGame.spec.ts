import { playAudio } from "@utilities/audio";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useGame } from "./useGame";

vi.mock("@utilities/audio", () => ({ playAudio: vi.fn<(name: string) => Promise<void>>(async () => {}) }));

function soundsForLastMove(pgn: string) {
  const game = useGame();
  game.loadPgn(pgn);
  while (game.tree.activeNode.value?.nextPosition) {
    vi.mocked(playAudio).mockClear();
    game.toNextMove();
  }
  return vi.mocked(playAudio).mock.calls.map(([name]) => name);
}

describe("useGame move sounds", () => {
  beforeEach(() => vi.clearAllMocks());

  it("plays the move sound for a quiet move", () => {
    expect(soundsForLastMove("1. e4 e5")).toEqual(["move"]);
  });

  it("plays the capture sound for a capture", () => {
    expect(soundsForLastMove("1. e4 d5 2. exd5")).toEqual(["capture"]);
  });

  it("adds the check sound to a move that gives check", () => {
    expect(soundsForLastMove("1. e4 f5 2. Qh5+")).toEqual(["move", "check"]);
  });

  it("adds the check sound to a capture that gives check", () => {
    expect(soundsForLastMove("1. e4 e5 2. Qh5 Nc6 3. Qxf7+")).toEqual(["capture", "check"]);
  });

  it("stays silent on a null move", () => {
    expect(soundsForLastMove("1. e4 --")).toEqual([]);
  });
});
