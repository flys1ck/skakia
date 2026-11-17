import { describe, expect, it } from "vitest";
import { PositionNode, useGameTree } from "./useGameTree";

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

  it("attaches an alternative first move to the starting position", () => {
    const tree = useGameTree();
    tree.fromPgn("1. e4 (1. d4 d5 2. c4) e5 2. Nf3 *");

    const root = tree.root.value!;
    expect(mainline(root)).toEqual(["e4", "e5", "Nf3"]);
    expect(root.variations.map(mainline)).toEqual([["d4", "d5", "c4"]]);
    expect(root.variations[0].ply).toBe(1);
  });

  it("keeps the moves that follow a null move", () => {
    const tree = useGameTree();
    tree.fromPgn("1. e4 e5 2. Nf3 (2. -- Nc6 3. d4) Nc6 *");

    const branch = tree.root.value!.nextPosition!.nextPosition!;
    expect(branch.variations.map(mainline)).toEqual([["--", "Nc6", "d4"]]);
    expect(branch.variations[0].nextPosition!.move?.piece.color).toBe("black");
  });

  it("merges variations that start with the same move", () => {
    const tree = useGameTree();
    tree.fromPgn("1. e4 e5 (1... c5 2. Nf3) (1... c5 2. c3) 2. Nf3 *");

    const e4 = tree.root.value!.nextPosition!;
    expect(e4.variations).toHaveLength(1);
    const c5 = e4.variations[0];
    expect(mainline(c5)).toEqual(["c5", "Nf3"]);
    expect(c5.variations.map(mainline)).toEqual([["c3"]]);
  });

  it("selects an existing move instead of adding it again", () => {
    const tree = useGameTree();
    tree.fromPgn("1. e4 e5 *");
    const e4 = tree.root.value!.nextPosition!;

    const added = tree.addNode(e4.fen, { move: e4.move });

    expect(added.id).toBe(e4.id);
    expect(tree.activeNode.value?.id).toBe(e4.id);
    expect(tree.root.value!.variations).toHaveLength(0);
  });

  it("records the moved piece and treats mate as check", () => {
    const tree = useGameTree();
    tree.fromPgn("1. f3 e5 2. g4 Qh4# *");

    const mate = tree.root.value!.nextPosition!.nextPosition!.nextPosition!.nextPosition!;
    expect(mate.move?.piece).toMatchObject({ role: "queen", color: "black" });
    expect(mate.move?.isCheck).toBe(true);
  });
});

function mainline(node: PositionNode | undefined): string[] {
  return node ? [...(node.move ? [node.move.san] : []), ...mainline(node.nextPosition)] : [];
}
