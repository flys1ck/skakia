import { Chessground } from "@lichess-org/chessground";
import { DrawShape } from "@lichess-org/chessground/draw";
import { Color, Key, Piece } from "@lichess-org/chessground/types";
import { getPossibleMoves } from "@utilities/move";

export interface Position {
  fen: string;
  turnColor: Color;
  lastMove?: Key[];
  isCheck?: boolean;
}

interface UseChessgroundOptions {
  orientation?: "white" | "black";
  position: Position;
  onMove?: (source: Key, destination: Key) => void;
}

export function useChessground(element: HTMLElement, options: UseChessgroundOptions) {
  const orientation = options.orientation ?? "white";
  const chessground = Chessground(element, {
    orientation: orientation,
    fen: options.position.fen,
    turnColor: options.position.turnColor,
    lastMove: options.position.lastMove,
    check: options.position.isCheck,
    movable: {
      color: options.position.turnColor,
      dests: getPossibleMoves(options.position.fen),
      free: false,
    },
    events: {
      move: options.onMove,
    },
    drawable: {
      // Brush colors land in SVG attributes, where CSS variables do not resolve.
      // Arrows drawn by hand use the "green" brush, so it carries the board's teal arrow color.
      brushes: {
        green: { key: "g", color: "#1f6f6b", opacity: 1, lineWidth: 10 },
        red: { key: "r", color: "#882020", opacity: 1, lineWidth: 10 },
        blue: { key: "b", color: "#003088", opacity: 1, lineWidth: 10 },
        yellow: { key: "y", color: "#e68f00", opacity: 1, lineWidth: 10 },
        paleTeal: { key: "pt", color: "#1f6f6b", opacity: 0.5, lineWidth: 15 },
      },
    },
  });

  // Chessground caches the board rect and only refreshes it on resize or scroll. A board that moves without
  // resizing (a sidebar collapsing beside a height-bound board) would map clicks to the wrong squares.
  for (const eventName of ["mousedown", "touchstart"]) {
    element.addEventListener(eventName, () => chessground.state.dom.bounds.clear(), { capture: true, passive: true });
  }

  function setPosition(position: Position) {
    chessground.set({
      fen: position.fen,
      turnColor: position.turnColor,
      lastMove: position.lastMove,
      check: position.isCheck,
      movable: {
        color: position.turnColor,
        dests: getPossibleMoves(position.fen),
        free: false,
      },
    });
  }

  function move(source: Key, dest: Key) {
    chessground.move(source, dest);
  }

  function setAutoShapes(shapes: DrawShape[]) {
    chessground.setAutoShapes(shapes);
  }

  /**
   * Sets the color to move and possible moves for the current board position.
   */
  function setTurn(fen: string, color: Color) {
    chessground.set({
      turnColor: color,
      movable: {
        color: color,
        dests: getPossibleMoves(fen),
      },
    });
  }

  function setCheck() {
    chessground.set({
      check: true,
    });
  }

  function setPiece(square: Key, piece: Piece | undefined) {
    chessground.setPieces(new Map([[square, piece]]));
  }

  function getLastMove() {
    return chessground.state.lastMove;
  }

  function getPiece(square: Key) {
    return chessground.state.pieces.get(square);
  }

  function getOrientation() {
    return chessground.state.orientation;
  }

  function toggleOrientation() {
    chessground.toggleOrientation();
  }

  return {
    setPosition,
    move,
    setAutoShapes,
    getLastMove,
    getPiece,
    getOrientation,
    toggleOrientation,
    setTurn,
    setPiece,
    setCheck,
  };
}
