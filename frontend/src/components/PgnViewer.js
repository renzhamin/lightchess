import React, { useLayoutEffect } from "react"
import { useHistory, useLocation } from "react-router-dom"
import { useState } from "react"
// import Children from "react-children-utilities";
import * as uuid from "uuid"
import { pgnView } from "@mliebelt/pgn-viewer"
import Grid from "@mui/material/Grid"
import TextField from "@mui/material/TextField"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import { Link } from "@mui/material"
import { getBoardWidth } from "../utils/getBoardWidth"
function PgnViewer(props) {
    // const gameDecription = Children.onlyText(props.children);
    const location = useLocation()
    const id = "board-" + uuid.v4()

    const [pgn, setPgn] = useState(
        location.pgn === undefined
            ? `1. d4 d5 2. Nc3 Nc6 3. Nxd5 Nxd4`
            : location.pgn
    )

    // const pgn =
    //     location.pgn === undefined
    //         ? `1. d4 d5 2. Nc3 Nc6 3. Nxd5 Nxd4`
    //         : location.pgn

    useLayoutEffect(() => {
        pgnView(id, {
            pgn: pgn,
            timerTime: 1,
            locale: "en",
            startPlay: 1,
            showResult: true,
            boardSize: getBoardWidth(),
            showFen: true,
            pieceStyle: "wikipedia",
            theme: "brown",
            resizable: false,
            // notationLayout: "list",
        })
    }, [pgn])

    function handleChange(e) {
        setPgn(e.target.value)
    }

    return (
        <Box sx={{ height: "100vh", overflow: "hidden" }}>
            <Grid>
                <Grid item align="center">
                    <div
                        className="pgnviewer"
                        id={id}
                        style={{
                            // left: "50%",
                            // right: "50%",
                            // top: "50%",
                            paddingTop: 10,
                        }}
                    ></div>
                </Grid>
                <Grid item align="center">
                    <TextField
                        id="outlined-basic"
                        label="Load custom PGN"
                        variant="outlined"
                        autoComplete="off"
                        sx={{
                            width: 720,
                        }}
                        onChange={handleChange}
                    />
                </Grid>
            </Grid>
        </Box>
    )
}

export default PgnViewer
