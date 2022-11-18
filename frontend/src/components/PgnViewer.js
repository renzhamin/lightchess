import React, { useLayoutEffect } from "react"
import { useHistory, useLocation } from "react-router-dom"
// import Children from "react-children-utilities";
import * as uuid from "uuid"
import { pgnView } from "@mliebelt/pgn-viewer"

function PgnViewer(props) {
    // const gameDecription = Children.onlyText(props.children);
    const location = useLocation()
    const id = "board-" + uuid.v4()

    const pgn =
        location.pgn === undefined
            ? `1. d4 d5 2. Nc3 Nc6 3. Nxd5 Nxd4`
            : location.pgn

    useLayoutEffect(() => {
        pgnView(id, {
            pgn: pgn,
            timerTime: 1,
            locale: "en",
            startPlay: 1,
            showResult: true,
            boardSize: "650",
            showFen: true,
            pieceStyle: "wikipedia",
            theme: "brown",
            resizable: true,
        })
    })

    return (
        <div
            className="pgnviewer"
            id={id}
            style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -45%)",
            }}
        ></div>
    )
}

export default PgnViewer
