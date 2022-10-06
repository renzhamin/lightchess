import React, { useLayoutEffect } from "react";
import Children from "react-children-utilities";
import * as uuid from "uuid";
import { pgnView } from "@mliebelt/pgn-viewer";

function PgnViewer(props) {
  const gameDecription = Children.onlyText(props.children);
  const id = "board-" + uuid.v4();

  useLayoutEffect(() => {
    pgnView(id, {
      pgn: gameDecription,
      timerTime: 1,
      locale: "en",
      startPlay: 1,
      showResult: true,
      boardSize: "650",
      showFen: true,
      pieceStyle: "merida",
      resizable: true,
    });
  });

  return <div id={id}></div>;
}

export default PgnViewer;
