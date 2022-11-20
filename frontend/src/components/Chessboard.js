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

function Board() {
    const { socket, userMap, username: myUsername } = useContext(AppContext)
    const Chess = typeof ChessJS === "function" ? ChessJS : ChessJS.Chess // For VS code intellisence to work
    const [game, setGame] = useState(new Chess())
    const [position, setPosition] = useState(game.fen())
    const [boardOrientation, setBoardOrientation] = useState("white")

    const [opponentTimeInfo, setOpponentTimeInfo] = useState("05:00")
    const [myTimeInfo, setMyTimeInfo] = useState("05:00")

    const [pgnMoves, setPgnMoves] = useState([])
    const [gameEndMessage, setGameEndMessage] = useState("")
    const [gameEndTitle, setGameEndTitle] = useState("")
    const [isGameOver, setIsGameOver] = useState(false)

    const { opponent_socket_id, mycolor } = useParams()
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

    function setEndDialogMessages() {
        // console.log(myInfo.data)
        // console.log(opponentInfo.data)
        console.log("at setEndDialogMessages", myInfo.data)

        console.log("Stopped timer, now updating deltas")

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

        console.log(myNewElo, opponentNewElo)
        // UPDATE DATABASE HERE WITH THESE NEW VALUES
    }

    const fetchData = async () => {
        myInfo = await axios.get(`${config.backend}/api/user/` + myUsername)
        opponentInfo = await axios.get(
            `${config.backend}/api/user/` + opponentUserName
        )
        console.log(myInfo, opponentInfo)
    }

    function gameEndHandler(iResigned) {
        if (iResigned) {
            resigned = true
        }
        myTimer.current.stopTimer()
        opponentTimer.current.stopTimer()
        setEndDialogMessages()
        handleClickOpen()
        console.log(gameResult)

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
        console.log("game over")

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
        console.log("Adding Game")
        console.log("add game", whiteElo, blackElo)
        try {
            // TODO: set game values properly
            console.log(game.pgn())
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
            console.log(error)
        }
    }

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

        console.log("Opponent is ", opponentUserName)
        if (mycolor == 1) setBoardOrientation("black")

        socket.on("send_move", (data) => {
            console.log(data.move)
            game.move(data.move)
            setPosition(game.fen())

            // timer
            opponentTimer.current.stopTimer()
            myTimer.current.startTimer()
            setMyTimeInfo(data.opponentTimeInfo)
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
            // console.log(myInfo.data)
            // console.log(opponentInfo.data)
            // NOT CONFIDENT THIS WORKS
            myTimer.current.stopTimer()
            opponentTimer.current.stopTimer()
            setMyTimeInfo(data.opponentTimeInfo)
            setOpponentTimeInfo(data.myTimeInfo)
            setEndDialogMessages()
            handleClickOpen()
            console.log("Game over!", data)
        })

        function convertTimeToString(time) {
            var time_ = time.toString()
            if (time < 10) time_ = "0" + time_

            return time_
        }

        const interval = setInterval(() => {
            // assuming I am white
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
                console.log("My time is over")
                gameEndHandler(true)
            }
        }, 500)

        return () => {
            socket.off("send_move")
            clearInterval(interval)
        }
    }, [isGameOver])

    function sendMove(move) {
        console.log("Sending Move", move)
        socket.emit("send_move", {
            to: opponent_socket_id,
            move,
            opponentTimeInfo,
            myTimeInfo,
        })
    }

    function onDrop(sourceSquare, targetSquare) {
        if (isGameOver) {
            console.log("Game is already over")
            return
        } else if (game.turn() !== boardOrientation[0]) {
            console.log("Not your turn!")
            return
        }

        var move = { from: sourceSquare, to: targetSquare }
        var result = game.move(move)

        if (result == null) {
            move = { from: sourceSquare, to: targetSquare, promotion: "q" }
            result = game.move(move)

            if (result == null) {
                console.log("Invalid move")
                return
            }
        }
        // if valid move

        playMoveSfx()

        opponentTimer.current.startTimer()
        myTimer.current.stopTimer()

        setPgnMoves(parsePgn(game.pgn()))
        console.log(parsePgn(game.pgn()))

        setPosition(game.fen())
        sendMove(move)
        console.log(isGameOver)

        if (game.isGameOver()) {
            gameEndHandler()
            addGame()
        }
    }

    function onSquareClick(square) {
        console.log(square)
    }

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
                    // myELO={"5"}
                    // opponentELO={"6"}
                    myTimeInfo={myTimeInfo}
                    pgnMoves={pgnMoves}
                    mySide={boardOrientation[0]}
                    turn={game.turn()}
                    gameOver={isGameOver}
                />
            </Grid>
            <Timer
                initialMinute={5}
                initialSeconds={0}
                isTicking={0}
                ref={opponentTimer}
            />
            <Timer
                initialMinute={5}
                initialSeconds={0}
                isTicking={0}
                ref={myTimer}
            />
        </Grid>
    )
}

export default Board
