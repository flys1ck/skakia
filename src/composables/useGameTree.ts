import { Key, Piece } from "@lichess-org/chessground/types";
import { formatComment } from "@utilities/comment";
import { NormalMove, Position, makeSquare, opposite } from "chessops";
import { makeFen, parseFen } from "chessops/fen";
import { ChildNode, PgnNodeData, parsePgn, startingPosition } from "chessops/pgn";
import { parseSan } from "chessops/san";
import { computed, ref } from "vue";

export interface ChessMove {
  source: Key;
  destination: Key;
  san: string;
  piece: Piece;
  isCheck: boolean;
  isCapture: boolean;
  annotations?: number[];
}

// a node describes a position
export interface PositionNode {
  // unique id
  id: string;
  fen: string;
  // amount of half moves played
  ply: number;
  // move is undefined, in the starting position
  move?: ChessMove;
  nextPosition?: PositionNode;
  // last played move before current fen position was reached
  previousPosition?: PositionNode;
  variations: PositionNode[];
  // extras
  comment?: string;
  // only available on variations
  startingComment?: string;
}

interface AddMoveOptions {
  move?: ChessMove;
  comment?: string;
  startingComment?: string;
}

export function useGameTree() {
  const root = ref<PositionNode>();
  const activeNode = ref<PositionNode>();

  // Adding a move that already continues the active node selects that node instead of duplicating it.
  function addNode(fen: string, options?: AddMoveOptions): PositionNode {
    const parent = activeNode.value;
    if (parent) {
      const existingNode = [parent.nextPosition, ...parent.variations].find(
        (child) => child && child.move?.san === options?.move?.san
      );
      if (existingNode) {
        setActiveNode(existingNode);
        return existingNode;
      }
    }

    const newNode: PositionNode = {
      id: crypto.randomUUID(),
      fen,
      ply: parent ? parent.ply + 1 : startingPly(fen),
      move: options?.move,
      previousPosition: parent,
      comment: options?.comment,
      startingComment: options?.startingComment,
      variations: [],
    };

    if (!root.value) root.value = newNode;
    if (parent?.nextPosition) parent.variations.push(newNode);
    else if (parent) parent.nextPosition = newNode;

    setActiveNode(newNode);
    return newNode;
  }

  function setActiveNode(node: PositionNode) {
    activeNode.value = node;
  }

  function reset() {
    root.value = undefined;
    activeNode.value = undefined;
  }

  function fromPgn(pgn: string) {
    const games = parsePgn(pgn);
    if (games.length === 0) return;
    reset();

    const game = games[0];
    const pos = startingPosition(game.headers).unwrap();
    const rootNode = addNode(makeFen(pos.toSetup()), { comment: formatComment(game.comments?.join("") ?? "") });

    const parseChild = (
      parent: PositionNode,
      child: ChildNode<PgnNodeData>,
      position: Position,
      previousMove?: NormalMove
    ) => {
      const isNullMove = child.data.san === "--";
      // a null move keeps showing the move before it
      const move = isNullMove ? previousMove : (parseSan(position, child.data.san) as NormalMove | undefined);
      if (!move) return;

      const color = position.turn;
      const role = position.board.getRole(isNullMove ? move.to : move.from)!;
      if (isNullMove) {
        if (position.turn === "black") position.fullmoves += 1;
        position.turn = opposite(position.turn);
        position.epSquare = undefined;
      } else {
        position.play(move);
      }

      setActiveNode(parent);
      const node = addNode(makeFen(position.toSetup()), {
        move: {
          source: makeSquare(move.from),
          destination: makeSquare(move.to),
          san: child.data.san,
          isCapture: child.data.san.includes("x"),
          isCheck: /[+#]/.test(child.data.san),
          piece: { role, color, promoted: !!move.promotion },
          annotations: child.data.nags,
        },
        comment: child.data.comments && formatComment(child.data.comments.join("")),
        startingComment: child.data.startingComments && formatComment(child.data.startingComments.join("")),
      });

      child.children.forEach((grandchild) => parseChild(node, grandchild, position.clone(), move));
    };
    game.moves.children.forEach((child) => parseChild(rootNode, child, pos.clone()));

    if (root.value) setActiveNode(root.value);
  }

  const mainline = computed(() => {
    const nodes: PositionNode[] = [];
    for (let node = root.value; node; node = node.nextPosition) nodes.push(node);
    return nodes;
  });

  return {
    root,
    activeNode,
    mainline,
    setActiveNode,
    addNode,
    reset,
    fromPgn,
  };
}

function startingPly(fen: string) {
  const setup = parseFen(fen).unwrap();
  return (setup.fullmoves - 1) * 2 + (setup.turn === "black" ? 1 : 0);
}
