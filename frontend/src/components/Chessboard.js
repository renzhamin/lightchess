import * as ChessJS from "chess.js";
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router";
import { Chessboard } from "react-chessboard";
import { AppContext } from "../App";

function Board() {
  const { socket } = useContext(AppContext);
  const Chess = typeof ChessJS === "function" ? ChessJS : ChessJS.Chess; // For VS code intellisence to work
  const [game, setGame] = useState(new Chess());
  const [position, setPosition] = useState(game.fen());
  const [boardOrientation, setBoardOrientation] = useState("white");

  const { id } = useParams();
  useEffect(() => {
    socket.on("send_fen", (data) => {
      console.log("GOOOOOT FEN FOR REAL");
      setPosition(data.fen);
    });

    return () => {
      socket.off("send_fen");
    };
  }, []);

  function sendFen(fen) {
    // TODO: send fen to opponent, get opponent fen
    // return opponent fen
    console.log("Sending Fen", fen);
    socket.emit("send_fen", { to: id, fen });
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
    sendFen(game.fen());
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
