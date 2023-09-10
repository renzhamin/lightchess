import { Grid, Snackbar } from "@mui/material"
import MuiAlert from "@mui/material/Alert"
import * as ChessJS from "chess.js"
import { forwardRef, useContext, useEffect, useRef, useState } from "react"
import { Chessboard } from "react-chessboard"
import { useParams } from "react-router"
import useSound from "use-sound"
import { AppContext } from "../App"
import { config } from "../config/config_env"
import { getBoardWidth } from "../utils/getBoardWidth"
import moveSfx from "./../components/static/sounds/Move.mp3"
import checkSfx from "./../components/static/sounds/Checkmate.mp3"
import GameEndDialog from "./GameEndDialog.js"
import GameInfo from "./GameInfo"
import parsePgn from "./PgnParser"
import Timer from "./Timer"

let myInfo = {}
let opponentInfo = {}

let myELO, opponentELO
let whiteElo, blackElo
let opponentHistory = ""
let initialMinute,
    initialSeconds,
    increment = 0

const Alert = forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
})

function Board() {
    const { socket, username, axiosJWT } = useContext(AppContext)
    const Chess = typeof ChessJS === "function" ? ChessJS : ChessJS.Chess // For VS code intellisence to work
    const [game, _] = useState(new Chess())
    const [position, setPosition] = useState(game.fen())
    const [boardOrientation, setBoardOrientation] = useState("white")

    const [opponentTimeInfo, setOpponentTimeInfo] = useState()
    const [myTimeInfo, setMyTimeInfo] = useState()

    const [pgnMoves, setPgnMoves] = useState([])
    const [gameEndMessage, setGameEndMessage] = useState("")
    const [gameEndTitle, setGameEndTitle] = useState("")
    const [isGameOver, setIsGameOver] = useState(false)
    const [isGameAdded, setIsGameAdded] = useState(false)
    const [open, setOpen] = useState(false)
    const [error, setError] = useState("")
    const [boardWidth, setBWidth] = useState(720)

    const { opponentUserName, mycolor, time_format } = useParams()

    const myTimer = useRef()
    const opponentTimer = useRef()

    const [playMoveSfx] = useSound(moveSfx)
    const [playCheckmateSfx] = useSound(checkSfx)

    const handleClickOpen = () => {
        setOpen(true)
    }

    function ratingDelta(myRating, opponentRating, myGameResult) {
        const myChanceToWin =
            1 / (1 + Math.pow(10, (opponentRating - myRating) / 400))

        return Math.round(32 * (myGameResult - myChanceToWin))
    }

    let resigned = false

    const handleClose = (value) => {
        setOpen(false)
    }

    function setTimeControl() {
        if (!time_format) return
        let parsed = time_format.split("+")
        initialMinute = parseInt(parsed[0])
        initialSeconds = 0
        increment = parseInt(parsed[1])
        setOpponentTimeInfo(
            convertTimeToString(initialMinute) +
                ":" +
                convertTimeToString(initialSeconds)
        )
        setMyTimeInfo(
            convertTimeToString(initialMinute) +
                ":" +
                convertTimeToString(initialSeconds)
        )
        opponentTimer.current.startMinutes(initialMinute)
        myTimer.current.startMinutes(initialMinute)
    }

    function setEndDialogMessages(iWon) {
        const delta = ratingDelta(
            Number(myInfo?.data.elo),
            Number(opponentInfo?.data?.elo),
            iWon
        )
        if (iWon) {
            setGameEndTitle("Victory!")
            setGameEndMessage("ELO +" + delta)
        } else {
            setGameEndTitle("Defeat!")
            setGameEndMessage("ELO " + delta)
        }
        let myNewElo = Number(myInfo?.data.elo) + delta
        let opponentNewElo = Number(opponentInfo?.data.elo) - delta

        // I am white
        whiteElo = myNewElo
        blackElo = opponentNewElo

        // I am black
        if (mycolor == 1) {
            ;[whiteElo, blackElo] = [blackElo, whiteElo]
        }

        // UPDATE DATABASE HERE WITH THESE NEW VALUES
    }

    function convertTimeToString(time) {
        var time_ = time.toString()
        if (time < 10) time_ = "0" + time_

        return time_
    }

    function gameEndHandler(iLost) {
        if (socket.disconnected) return
        let winner = iLost ? opponentUserName : username

        socket.timeout(5000).emit(
            "game_over",
            {
                to: opponentUserName,
                winner,
                opponentTimeInfo,
                myTimeInfo,
            },
            (_, res) => {
                if (res !== "success") return

                if (iLost) {
                    resigned = true
                }
                myTimer?.current.stopTimer()
                opponentTimer?.current.stopTimer()
                setEndDialogMessages(!iLost)
                handleClickOpen()
                setIsGameOver(true)

                addGame(!iLost)
            }
        )
    }

    /* const areYouWinningSon = () => { */
    /*     if ( */
    /*         resigned || */
    /*         (game.isGameOver() && boardOrientation[0] == game.turn()) */
    /*     ) { */
    /*         return false */
    /*     } */
    /*     return true */
    /* } */

    const addGame = async (iWon = false) => {
        if (isGameAdded) return
        try {
            // TODO: set game values properly
            await axiosJWT.post(`${config.backend}/api/games`, {
                whiteUserName: mycolor == 1 ? opponentUserName : username,
                blackUserName: mycolor == 1 ? username : opponentUserName,
                winnerUserName: iWon ? username : opponentUserName,
                loserUserName: iWon ? opponentUserName : username,
                pgn: game.pgn(),
                whiteUserElo: whiteElo,
                blackUserElo: blackElo,
            })
            setIsGameAdded(true)
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        setTimeControl()
        setBWidth(getBoardWidth())
        if (mycolor == 1) setBoardOrientation("black")

        axiosJWT.get(`${config.backend}/api/user/` + username).then((data) => {
            myInfo = data
            myELO = myInfo?.data.elo
        })
        axiosJWT
            .get(`${config.backend}/api/user/` + opponentUserName)
            .then((data) => {
                opponentInfo = data
                opponentELO = opponentInfo?.data.elo
            })

        axiosJWT
            .get(
                `${config.backend}/api/user/` + opponentUserName + "/recents/5"
            )
            .then((data) => {
                opponentHistory = data.data.str
            })
    }, [])

    useEffect(() => {
        socket.on("send_move", (data, ack) => {
            ack("success")
            game.move(data.move)
            setPosition(game.fen())

            // timer
            opponentTimer.current.stopTimer()
            myTimer.current.startTimer()
            myTimer.current.setAll(data.opponentMinutes, data.opponentSeconds)
            opponentTimer.current.setAll(data.myMinutes, data.mySeconds)
            opponentTimer.current.incrementTimer(increment)
            setOpponentTimeInfo(data.myTimeInfo)
            setPgnMoves(parsePgn(game.pgn()))

            // TODO: checkmate sound does not seem to play
            if (game.isGameOver()) {
                playCheckmateSfx()
            } else {
                playMoveSfx()
            }

            // TODO: sync time
        })

        socket.on("game_over", (data, ack) => {
            ack("success")
            setIsGameOver(true)
            myTimer?.current?.stopTimer()
            opponentTimer?.current?.stopTimer()
            setMyTimeInfo(data.opponentTimeInfo)
            setOpponentTimeInfo(data.myTimeInfo)
            setEndDialogMessages(data.winner === username)
            handleClickOpen()
        })

        return () => {
            socket.off("send_move")
            socket.off("game_over")
        }
    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
            // assuming I am white
            if (myTimer && opponentTimer && initialMinute) {
                const blackTime =
                    convertTimeToString(myTimer.current.getMinutes()) +
                    ":" +
                    convertTimeToString(myTimer.current.getSeconds())
                setOpponentTimeInfo(blackTime)

                const opponentTime =
                    convertTimeToString(opponentTimer.current.getMinutes()) +
                    ":" +
                    convertTimeToString(opponentTimer.current.getSeconds())
                setMyTimeInfo(opponentTime)

                if (
                    !isGameOver &&
                    myTimer.current.getMinutes() === 0 &&
                    myTimer.current.getSeconds() === 0
                ) {
                    gameEndHandler(true)
                }
            }
        }, 500)

        return () => {
            clearInterval(interval)
        }
    }, [isGameOver])

    function onDrop(sourceSquare, targetSquare) {
        if (isGameOver) return
        if (socket.disconnected) {
            setError("You are disconnected right now")
            return
        } else if (game.turn() !== boardOrientation[0]) {
            return
        }

        let move_success = false

        let move = { from: sourceSquare, to: targetSquare, promotion: "q" }
        try {
            let result = game.move(move)
            if (result == null) {
                return
            } else {
                setPosition(game.fen())
                move_success = true
            }
        } catch (err) {
            return
        }

        const myMinutes = myTimer.current.getMinutes(),
            mySeconds = myTimer.current.getSeconds()
        const opponentMinutes = opponentTimer.current.getMinutes(),
            opponentSeconds = opponentTimer.current.getSeconds()

        socket.timeout(2000).emit(
            "send_move",
            {
                to: opponentUserName,
                move,
                myMinutes,
                mySeconds,
                opponentMinutes,
                opponentSeconds,
            },
            (_, res) => {
                if (res !== "success") {
                    if (move_success) {
                        game.undo()
                        setPosition(game.fen())
                        setError("Opponent is disconnected")
                    }
                    return
                }

                // if valid move

                playMoveSfx()

                myTimer.current.incrementTimer(increment)
                opponentTimer.current.startTimer()
                myTimer.current.stopTimer()

                setPgnMoves(parsePgn(game.pgn()))

                if (game.isGameOver()) {
                    gameEndHandler(false)
                }
            }
        )
    }

    return (
        <Grid
            height={"100%"}
            container
            direction="row"
            alignItems="center"
            justifyContent="center"
            position={"relative"}
            marginTop={5}
        >
            <Snackbar
                open={error.length > 0}
                autoHideDuration={1500}
                onClose={() => setError("")}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                key={"bottomright"}
            >
                <Alert
                    onClose={handleClose}
                    severity="error"
                    sx={{ width: "100%" }}
                >
                    {error}
                </Alert>
            </Snackbar>

            <Grid item>
                <GameEndDialog
                    open={open}
                    onClose={handleClose}
                    gameEndMessage={gameEndMessage}
                    gameEndTitle={gameEndTitle}
                />
            </Grid>
            <Grid item height="100%" className="flex-center">
                <Chessboard
                    id="BasicBoard"
                    showBoardNotation="true"
                    position={position}
                    onPieceDrop={onDrop}
                    boardOrientation={boardOrientation}
                    arePremovesAllowed="true"
                    clearPremovesOnRightClick="true"
                    boardWidth={boardWidth}
                />
            </Grid>
            <Grid item marginTop={4} height="100%" className="flex-center">
                <GameInfo
                    gameEndHandler={gameEndHandler}
                    opponentUserName={opponentUserName}
                    myUsername={username}
                    opponentTimeInfo={opponentTimeInfo}
                    opponentHistory={opponentHistory}
                    myELO={myELO}
                    opponentELO={opponentELO}
                    myTimeInfo={myTimeInfo}
                    pgnMoves={pgnMoves}
                    mySide={boardOrientation[0]}
                    turn={game.turn()}
                    gameOver={isGameOver}
                />
            </Grid>
            <Timer
                initialMinute={initialMinute}
                initialSeconds={initialSeconds}
                isTicking={0}
                ref={opponentTimer}
            />
            <Timer
                initialMinute={initialMinute}
                initialSeconds={initialSeconds}
                isTicking={0}
                ref={myTimer}
            />
        </Grid>
    )
}

export default Board
