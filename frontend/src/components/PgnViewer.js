import React, { useLayoutEffect } from "react";
// import Children from "react-children-utilities";
import * as uuid from "uuid";
import { pgnView } from "@mliebelt/pgn-viewer";

function PgnViewer(props) {
  // const gameDecription = Children.onlyText(props.children);
  const id = "board-" + uuid.v4();

  const pgn = `
  1. d4 d5 2. Nc3 Nc6 3. Nxd5 Nxd4
  `;

  useLayoutEffect(() => {
    pgnView(id, {
      pgn: pgn,
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

  return <div className="pgnviewer" id={id}></div>;
}

export default PgnViewer;
