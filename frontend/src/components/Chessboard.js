import { Grid, Snackbar } from "@mui/material"
import MuiAlert from "@mui/material/Alert"
import * as ChessJS from "chess.js"
import { forwardRef, useContext, useEffect, useRef, useState } from "react"
import { Chessboard } from "react-chessboard"
import { useParams } from "react-router"
import useSound from "use-sound"
import { AppContext } from "../App"
import { config } from "../config/config_env"
import moveSfx from "./../components/static/sounds/Move.mp3"
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
let timeUpdated = false

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

    const { opponentUserName, mycolor, time_format } = useParams()

    const myTimer = useRef()
    const opponentTimer = useRef()

    const [playMoveSfx] = useSound(moveSfx)
    /* const [playCheckmateSfx] = useSound(CheckmateSfx) */

    const handleClickOpen = () => {
        setOpen(true)
    }

    function ratingDelta(myRating, opponentRating, myGameResult) {
        var myChanceToWin =
            1 / (1 + Math.pow(10, (opponentRating - myRating) / 400))

        return Math.round(32 * (myGameResult - myChanceToWin))
    }

    var resigned = false

    const handleClose = (value) => {
        setOpen(false)
    }

    function setTimeControl() {
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

    function setEndDialogMessages() {
        var delta = ratingDelta(
            myInfo?.data.elo,
            opponentInfo?.data?.elo,
            areYouWinningSon()
        )
        if (areYouWinningSon()) {
            setGameEndTitle("Victory!")
            setGameEndMessage("ELO +" + delta)
        } else {
            setGameEndTitle("Defeat!")
            setGameEndMessage("ELO " + delta)
        }
        let myNewElo = myInfo?.data.elo + delta
        let opponentNewElo = opponentInfo?.data.elo - delta

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

    function gameEndHandler(iResigned) {
        if (socket.disconnected) return
        let gameResult = ""

        //TODO: Make sure this shows correct result, for all 4 cases:
        // - Checkmate
        // - Resign
        // - Timeover
        // - Draw

        if (iResigned) {
            gameResult += username + " Lost"
        } else if (game.isCheckmate()) {
            if (game.inCheck() && game.turn() === boardOrientation) {
                // player lost, opponent won
                gameResult += game.turn() + " Lost"
            } else {
                const opponent = game.turn() === "w" ? "b" : "w"
                gameResult += opponent + " Lost"
            }
        } else if (game.isDraw()) {
            gameResult += "Game Drawn"
            if (game.isInsufficientMaterial()) {
            } else if (game.isStalemate()) {
            } else if (game.isThreefoldRepetition()) {
            }
        }

        socket.timeout(5000).emit(
            "game_over",
            {
                to: opponentUserName,
                gameResult,
                opponentTimeInfo,
                myTimeInfo,
            },
            (_, res) => {
                if (res !== "success") return

                if (iResigned) {
                    resigned = true
                }
                myTimer?.current.stopTimer()
                opponentTimer?.current.stopTimer()
                setEndDialogMessages()
                handleClickOpen()
                setIsGameOver(true)

                if (iResigned) {
                    addGame()
                }
            }
        )
    }

    const areYouWinningSon = () => {
        if (
            resigned ||
            (game.isGameOver() && boardOrientation[0] == game.turn())
        ) {
            return false
        }
        return true
    }

    const addGame = async () => {
        if (isGameAdded) return
        try {
            // TODO: set game values properly
            await axiosJWT.post(`${config.backend}/api/games`, {
                whiteUserName: mycolor == 1 ? opponentUserName : username,
                blackUserName: mycolor == 1 ? username : opponentUserName,
                winnerUserName: areYouWinningSon()
                    ? username
                    : opponentUserName,
                loserUserName: areYouWinningSon() ? opponentUserName : username,
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

        if (mycolor == 1) setBoardOrientation("black")
    }, [])

    useEffect(() => {
        socket.on("send_move", (data, ack) => {
            try {
                game.move(data.move)
                setPosition(game.fen())

                ack("success")

                // timer
                opponentTimer.current.stopTimer()
                myTimer.current.startTimer()
                myTimer.current.setAll(
                    data.opponentMinutes,
                    data.opponentSeconds
                )
                opponentTimer.current.setAll(data.myMinutes, data.mySeconds)
                setOpponentTimeInfo(data.myTimeInfo)
                setPgnMoves(parsePgn(game.pgn()))

                // TODO: checkmate sound does not seem to play
                // if (game.isGameOver()) {
                //     playCheckmateSfx()
                //     console.log("checkmate sound played")
                // } else {
                playMoveSfx()
                // }

                if (game.isGameOver()) {
                    gameEndHandler()
                    // TODO: create a gameResult to send to opponent
                }

                // TODO: sync time
            } catch (err) {
                console.error(err)
            }
        })

        socket.on("game_over", (data, ack) => {
            setIsGameOver(true)
            myTimer?.current?.stopTimer()
            opponentTimer?.current?.stopTimer()
            setMyTimeInfo(data.opponentTimeInfo)
            setOpponentTimeInfo(data.myTimeInfo)
            setEndDialogMessages()
            handleClickOpen()
            ack("success")
        })

        return () => {
            socket.off("send_move")
            socket.off("game_over")
        }
    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
            // assuming I am white
            if (!timeUpdated) {
                setTimeControl()
                timeUpdated = true
            }
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
            setError("Disconnected right now")
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
                        setError("Move failed due to connection error")
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
                    gameEndHandler()
                    addGame()
                }
            }
        )
    }

    function onSquareClick(square) {}

    return (
        <Grid
            container
            sx={{ mt: 5 }}
            direction="row"
            alignItems="center"
            justifyContent="center"
            spacing={3}
        >
            <Snackbar
                open={error.length > 0}
                autoHideDuration={2000}
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
            <Grid item>
                <Chessboard
                    id="BasicBoard"
                    showBoardNotation="true"
                    position={position}
                    onPieceDrop={onDrop}
                    boardOrientation={boardOrientation}
                    arePremovesAllowed="true"
                    clearPremovesOnRightClick="true"
                    onSquareClick={onSquareClick}
                    boardWidth="720"
                />
            </Grid>
            <Grid item>
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
