import { Chessboard } from "react-chessboard";
import * as ChessJS from "chess.js";
import { useState } from "react";

function Board() {
  const Chess = typeof ChessJS === "function" ? ChessJS : ChessJS.Chess; // For VS code intellisence to work
  const [game, setGame] = useState(new Chess());
  const [position, setPosition] = useState(game.fen());

  function onDrop(sourceSquare, targetSquare) {
    const move = { from: sourceSquare, to: targetSquare };

    const result = game.move(move);
    if (result == null) {
      console.log("Invalid");
    } else {
      setPosition(game.fen());
    }
  }

  return (
    <div>
      <Chessboard
        id="BasicBoard"
        showBoardNotation="true"
        position={position}
        onPieceDrop={onDrop}
      />
    </div>
  );
}

export default Board;
