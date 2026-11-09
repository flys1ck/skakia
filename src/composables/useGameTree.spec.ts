import { describe, expect, it } from "vitest";
import { useGameTree } from "./useGameTree";

describe("useGameTree", () => {
  it("numbers moves from the FEN of a custom starting position", () => {
    const tree = useGameTree();
    tree.fromPgn(
      '[SetUp "1"]\n[FEN "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2"]\n\n2... Nc6 3. Bb5 *'
    );

    const root = tree.root.value!;
    const first = root.nextPosition!;
    const second = first.nextPosition!;
    expect(root.ply).toBe(3);
    expect([first.ply, first.move?.piece.color]).toEqual([4, "black"]);
    expect([second.ply, second.move?.piece.color]).toEqual([5, "white"]);
  });

  it("writes full move numbers to the PGN", () => {
    const tree = useGameTree();
    tree.fromPgn("1. e4 e5 2. Nf3 Nc6 3. Bb5 *");

    expect(tree.pgn.value.trim()).toBe("1. e4 e5 2. Nf3 Nc6 3. Bb5");
  });

  it("marks a first move by black with an ellipsis in the PGN", () => {
    const tree = useGameTree();
    tree.fromPgn(
      '[SetUp "1"]\n[FEN "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2"]\n\n2... Nc6 3. Bb5 a6 *'
    );

    expect(tree.pgn.value.trim()).toBe("2... Nc6 3. Bb5 a6");
  });
});
