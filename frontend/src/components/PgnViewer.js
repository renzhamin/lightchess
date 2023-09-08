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
            boardSize: "650",
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

    function Copyright(props) {
        return (
            <Typography
                variant="body2"
                color="text.secondary"
                align="center"
                {...props}
            >
                {"Copyright © "}
                <Link
                    color="inherit"
                    href="https://github.com/renzhamin/lightchess"
                >
                    renzhamin
                </Link>{" "}
                {new Date().getFullYear()}
                {"."}
            </Typography>
        )
    }

    return (
        <>
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
            <Copyright sx={{ mt: 8, mb: 4 }} />
        </>
    )
}

export default PgnViewer
