import axios from "axios"
import * as ChessJS from "chess.js"
import { useContext, useEffect, useState, useRef } from "react"
import { useParams } from "react-router"
import { Chessboard } from "react-chessboard"
import { AppContext } from "../App"
import { Grid } from "@mui/material"
import GameInfo from "./GameInfo"
import Timer from "./Timer"
import useSound from "use-sound"
import moveSfx from "./../components/static/sounds/Move.mp3"
import captureSfx from "./../components/static/sounds/Capture.mp3"
import CheckmateSfx from "./../components/static/sounds/Checkmate.mp3"
import parsePgn from "./PgnParser"
import GameEndDialog from "./GameEndDialog.js"
import { Typography, Button } from "@mui/material"
import * as React from "react"
import PropTypes from "prop-types"
import Avatar from "@mui/material/Avatar"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemAvatar from "@mui/material/ListItemAvatar"
import ListItemText from "@mui/material/ListItemText"
import DialogTitle from "@mui/material/DialogTitle"
import Dialog from "@mui/material/Dialog"
import PersonIcon from "@mui/icons-material/Person"
import AddIcon from "@mui/icons-material/Add"
import { blue } from "@mui/material/colors"
import { config } from "../config/config_env"

var myInfo = {}
var opponentInfo = {}

var myELO, opponentELO
var whiteElo, blackElo
var opponentHistory = ""
var initialMinute,
    initialSeconds,
    increment = 0
var timeUpdated = false

function Board() {
    const { socket, userMap, username: myUsername } = useContext(AppContext)
    const Chess = typeof ChessJS === "function" ? ChessJS : ChessJS.Chess // For VS code intellisence to work
    const [game, setGame] = useState(new Chess())
    const [position, setPosition] = useState(game.fen())
    const [boardOrientation, setBoardOrientation] = useState("white")

    const [opponentTimeInfo, setOpponentTimeInfo] = useState()
    const [myTimeInfo, setMyTimeInfo] = useState()

    const [pgnMoves, setPgnMoves] = useState([])
    const [gameEndMessage, setGameEndMessage] = useState("")
    const [gameEndTitle, setGameEndTitle] = useState("")
    const [isGameOver, setIsGameOver] = useState(false)

    const { opponent_socket_id, mycolor, time_format } = useParams()
    const [opponentUserName] = useState(
        userMap.get(opponent_socket_id)?.username
    )

    const myTimer = useRef()
    const opponentTimer = useRef()

    const [playMoveSfx] = useSound(moveSfx)
    const [playCheckmateSfx] = useSound(CheckmateSfx)

    const [open, setOpen] = React.useState(false)

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
            myInfo.data.elo,
            opponentInfo.data.elo,
            areYouWinningSon()
        )
        if (areYouWinningSon()) {
            setGameEndTitle("Victory!")
            setGameEndMessage("ELO +" + delta)
        } else {
            setGameEndTitle("Defeat!")
            setGameEndMessage("ELO " + delta)
        }
        let myNewElo = myInfo.data.elo + delta
        let opponentNewElo = opponentInfo.data.elo - delta

        // I am white
        whiteElo = myNewElo
        blackElo = opponentNewElo

        // I am black
        if (mycolor == 1) {
            ;[whiteElo, blackElo] = [blackElo, whiteElo]
        }

        // UPDATE DATABASE HERE WITH THESE NEW VALUES
    }

    const fetchData = async () => {
        myInfo = await axios.get(`${config.backend}/api/user/` + myUsername)
        opponentInfo = await axios.get(
            `${config.backend}/api/user/` + opponentUserName
        )
    }

    function convertTimeToString(time) {
        var time_ = time.toString()
        if (time < 10) time_ = "0" + time_

        return time_
    }

    function gameEndHandler(iResigned) {
        if (iResigned) {
            resigned = true
        }
        myTimer.current.stopTimer()
        opponentTimer.current.stopTimer()
        setEndDialogMessages()
        handleClickOpen()

        setIsGameOver(true)
        var gameResult = ""

        //TODO: Make sure this shows correct result, for all 4 cases:
        // - Checkmate
        // - Resign
        // - Timeover
        // - Draw

        if (iResigned) {
            gameResult += myUsername + " Lost"
            addGame()
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

        socket.emit("game_over", {
            to: opponent_socket_id,
            gameResult,
            opponentTimeInfo,
            myTimeInfo,
        })

        // send gameResult through "game_over"

        // update game table
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
        try {
            // TODO: set game values properly
            await axios.post(`${config.backend}/api/games`, {
                whiteUserName: mycolor == 1 ? opponentUserName : myUsername,
                blackUserName: mycolor == 1 ? myUsername : opponentUserName,
                winnerUserName: areYouWinningSon()
                    ? myUsername
                    : opponentUserName,
                loserUserName: areYouWinningSon()
                    ? opponentUserName
                    : myUsername,
                pgn: game.pgn(),
                whiteUserElo: whiteElo,
                blackUserElo: blackElo,
            })
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        const interval = setInterval(() => {
            // assuming I am white
            if (!timeUpdated) {
                setTimeControl()
                timeUpdated = true
            }
        }, 1000)
    }, [])

    useEffect(() => {
        // fetchData()
        axios.get(`${config.backend}/api/user/` + myUsername).then((data) => {
            myInfo = data
            myELO = myInfo.data.elo
        })
        axios
            .get(`${config.backend}/api/user/` + opponentUserName)
            .then((data) => {
                opponentInfo = data
                opponentELO = opponentInfo.data.elo
            })

        axios
            .get(
                `${config.backend}/api/user/` + opponentUserName + "/recents/5"
            )
            .then((data) => {
                opponentHistory = data.data.str
            })

        if (mycolor == 1) setBoardOrientation("black")

        socket.on("send_move", (data) => {
            game.move(data.move)
            setPosition(game.fen())

            // timer
            opponentTimer.current.stopTimer()
            myTimer.current.startTimer()
            myTimer.current.setAll(data.opponentMinutes, data.opponentSeconds)
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
        })

        socket.on("game_over", (data) => {
            setIsGameOver(true)
            // NOT CONFIDENT THIS WORKS
            myTimer.current.stopTimer()
            opponentTimer.current.stopTimer()
            setMyTimeInfo(data.opponentTimeInfo)
            setOpponentTimeInfo(data.myTimeInfo)
            setEndDialogMessages()
            handleClickOpen()
        })

        const interval = setInterval(() => {
            // assuming I am white
            if (!timeUpdated) {
                setTimeControl()
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
            socket.off("send_move")
            clearInterval(interval)
        }
    }, [isGameOver])

    function sendMove(move) {
        var myMinutes = myTimer.current.getMinutes(),
            mySeconds = myTimer.current.getSeconds()
        var opponentMinutes = opponentTimer.current.getMinutes(),
            opponentSeconds = opponentTimer.current.getSeconds()
        socket.emit("send_move", {
            to: opponent_socket_id,
            move,
            myMinutes,
            mySeconds,
            opponentMinutes,
            opponentSeconds,
        })
    }

    function onDrop(sourceSquare, targetSquare) {
        if (isGameOver) {
            return
        } else if (game.turn() !== boardOrientation[0]) {
            return
        }

        let move = { from: sourceSquare, to: targetSquare }
        try {
            let result = game.move(move)
            if (result == null) {
                move = { from: sourceSquare, to: targetSquare, promotion: "q" }
                result = game.move(move)

                if (result == null) {
                    return
                }
            }
        } catch (err) {
            return
        }

        // if valid move

        playMoveSfx()

        myTimer.current.incrementTimer(increment)
        opponentTimer.current.startTimer()
        myTimer.current.stopTimer()

        setPgnMoves(parsePgn(game.pgn()))

        setPosition(game.fen())
        sendMove(move)

        if (game.isGameOver()) {
            gameEndHandler()
            addGame()
        }
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
                    myUsername={myUsername}
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
