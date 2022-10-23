import { Chessboard } from "react-chessboard";
import * as ChessJS from "chess.js";
import { useState } from "react";

function Board() {
  const Chess = typeof ChessJS === "function" ? ChessJS : ChessJS.Chess; // For VS code intellisence to work
  const [game, setGame] = useState(new Chess());
  const [position, setPosition] = useState(game.fen());
  const [boardOrientation, setBoardOrientation] = useState("white");

  function sendFen(fen) {
    // TODO: send fen to opponent, get opponent fen
    // return opponent fen
    console.log(fen);

    return null;
  }

  function onDrop(sourceSquare, targetSquare) {
    if (game.turn() !== boardOrientation[0]) {
      console.log("Not your turn!");
      return;
    }

    var move = { from: sourceSquare, to: targetSquare };
    var result = game.move(move);

    if (result == null) {
      move = { from: sourceSquare, to: targetSquare, promotion: "q" };
      result = game.move(move);

      if (result == null) {
        console.log("Invalid move");
        return;
      }
    }

    // if valid move
    setPosition(game.fen());

    const response = sendFen(game.fen());

    if (response !== null) {
      setPosition(game.fen());
    }

    setPosition(game.fen());
  }

  return (
    <div>
      <Chessboard
        id="BasicBoard"
        showBoardNotation="true"
        position={position}
        onPieceDrop={onDrop}
        boardOrientation={boardOrientation}
      />
    </div>
  );
}

export default Board;
