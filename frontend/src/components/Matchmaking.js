import CloseIcon from "@mui/icons-material/Close"
import LoadingButton from "@mui/lab/LoadingButton"
import {
    Container,
    CssBaseline,
    Grid,
    IconButton,
    Typography,
} from "@mui/material"
import { useContext, useEffect, useState } from "react"
import { useHistory } from "react-router-dom"
import { AppContext } from "../App.js"
import { config } from "../config/config_env"

let myELO = 1200
let myInfo
let myTimeControl = "-1"
let receiver
let myColor
let queueStatus = -1

export const Matchmaking = () => {
    const history = useHistory()
    const [inQueue, setInQueue] = useState(false)

    const {
        username,
        axiosJWT,
        socket,
        initReady,
        readyUserList,
        updateReadyUserList,
    } = useContext(AppContext)

    useEffect(() => {
        if (inQueue) {
            findOpponent()
        }
    }, [readyUserList])

    useEffect(() => {
        if (!username) {
            axiosJWT.get(`${config.backend}/api/health`)
        }
        if (!myInfo && username) {
            axiosJWT
                .get(`${config.backend}/api/user/` + username)
                .then((data) => {
                    myInfo = data
                    myELO = myInfo.data.elo
                })
        }

        socket.on("Challenge", (data, ack) => {
            Dequeue()
            history.push(
                "/play/" +
                    data.from +
                    "/" +
                    data.yourcolor +
                    "/" +
                    myTimeControl
            )
            ack("success")
        })

        const interval = setInterval(() => {
            updateReadyUserList()
        }, 2000)

        return () => {
            socket.off("Challenge")
            clearInterval(interval)
        }
    }, [])

    const Challenge = () => {
        // e.preventDefault()
        socket.emit(
            "Challenge",
            {
                to: receiver.username,
                msg: "challenge",
                yourcolor: myColor == 1 ? 0 : 1,
            },
            (res) => {
                if (res !== "success") return
                Dequeue()
                history.push(
                    "/play/" +
                        receiver.username +
                        "/" +
                        myColor +
                        "/" +
                        myTimeControl
                )
            }
        )
    }

    function findOpponent() {
        for (let i = 0; i < readyUserList.length; i++) {
            if (
                myTimeControl === readyUserList[i].timeControl &&
                username != readyUserList[i].username
            ) {
                myColor = Math.floor(Math.random() * 2)
                receiver = readyUserList[i]
                Challenge()
                socket.emit("rmReady")
            }
        }
    }

    function Enqueue(timeControl) {
        Dequeue()
        socket.emit("rmReady")
        setInQueue(true)
        if (queueStatus == timeControl) queueStatus = -1
        else queueStatus = timeControl
        myTimeControl = timeControl
        myELO = myInfo?.data.elo
        initReady({ username, timeControl })
    }

    function Dequeue() {
        socket.emit("rmReady")
        setInQueue(false)
        queueStatus = -1
    }

    function customHandler() {
        if ((queueStatus = "custom")) queueStatus = -1
        else queueStatus = "custom"
    }

    return (
        <Container component="main">
            <CssBaseline />
            <Typography variant="h3" sx={{ m: 5 }} align="center">
                Find Game
            </Typography>
            <Grid
                container
                spacing={0}
                alignItems="center"
                justifyContent="center"
            >
                <LoadingButton
                    sx={{ m: 2 }}
                    style={{
                        maxWidth: "150px",
                        maxHeight: "150px",
                        minWidth: "150px",
                        minHeight: "150px",
                    }}
                    loading={queueStatus === "1+0"}
                    onClick={() => Enqueue("1+0")}
                    variant="contained"
                    color="secondary"
                >
                    {" "}
                    1+0 {<br />}Bullet{" "}
                </LoadingButton>
                <LoadingButton
                    sx={{ m: 2 }}
                    style={{
                        maxWidth: "150px",
                        maxHeight: "150px",
                        minWidth: "150px",
                        minHeight: "150px",
                    }}
                    loading={queueStatus === "1+1"}
                    onClick={() => Enqueue("1+1")}
                    variant="contained"
                    color="secondary"
                    disabled
                >
                    {" "}
                    1+1 {<br />}Bullet{" "}
                </LoadingButton>
                <LoadingButton
                    sx={{ m: 2 }}
                    style={{
                        maxWidth: "150px",
                        maxHeight: "150px",
                        minWidth: "150px",
                        minHeight: "150px",
                    }}
                    loading={queueStatus === "3+0"}
                    onClick={() => Enqueue("3+0")}
                    variant="contained"
                    color="secondary"
                >
                    {" "}
                    3+0 {<br />}Blitz{" "}
                </LoadingButton>
                <LoadingButton
                    sx={{ m: 2 }}
                    style={{
                        maxWidth: "150px",
                        maxHeight: "150px",
                        minWidth: "150px",
                        minHeight: "150px",
                    }}
                    loading={queueStatus === "3+3"}
                    onClick={() => Enqueue("3+3")}
                    variant="contained"
                    color="secondary"
                    disabled
                >
                    {" "}
                    3+3{<br />} Blitz{" "}
                </LoadingButton>
            </Grid>
            <Grid
                container
                spacing={0}
                alignItems="center"
                justifyContent="center"
            >
                <LoadingButton
                    sx={{ m: 2 }}
                    style={{
                        maxWidth: "150px",
                        maxHeight: "150px",
                        minWidth: "150px",
                        minHeight: "150px",
                    }}
                    loading={queueStatus === "5+0"}
                    onClick={() => Enqueue("5+0")}
                    variant="contained"
                    color="secondary"
                >
                    {" "}
                    5+0 {<br />} Blitz
                </LoadingButton>
                <LoadingButton
                    sx={{ m: 2 }}
                    style={{
                        maxWidth: "150px",
                        maxHeight: "150px",
                        minWidth: "150px",
                        minHeight: "150px",
                    }}
                    loading={queueStatus === "5+5"}
                    onClick={() => Enqueue("5+5")}
                    variant="contained"
                    color="secondary"
                    disabled
                >
                    {" "}
                    5+5 {<br />}Blitz{" "}
                </LoadingButton>
                <LoadingButton
                    sx={{ m: 2 }}
                    style={{
                        maxWidth: "150px",
                        maxHeight: "150px",
                        minWidth: "150px",
                        minHeight: "150px",
                    }}
                    loading={queueStatus === "10+0"}
                    onClick={() => Enqueue("10+0")}
                    variant="contained"
                    color="secondary"
                >
                    {" "}
                    10+0 {<br />}Rapid{" "}
                </LoadingButton>
                <LoadingButton
                    sx={{ m: 2 }}
                    style={{
                        maxWidth: "150px",
                        maxHeight: "150px",
                        minWidth: "150px",
                        minHeight: "150px",
                    }}
                    loading={queueStatus === "10+10"}
                    onClick={() => Enqueue("10+10")}
                    variant="contained"
                    color="secondary"
                    disabled
                >
                    {" "}
                    10+10 {<br />}Rapid{" "}
                </LoadingButton>
            </Grid>
            <Grid
                container
                spacing={0}
                alignItems="center"
                justifyContent="center"
            >
                <LoadingButton
                    sx={{ m: 2 }}
                    style={{
                        maxWidth: "150px",
                        maxHeight: "150px",
                        minWidth: "150px",
                        minHeight: "150px",
                    }}
                    loading={queueStatus === "30+0"}
                    onClick={() => Enqueue("30+0")}
                    variant="contained"
                    color="secondary"
                >
                    {" "}
                    30+0{<br />} Classical{" "}
                </LoadingButton>
                <LoadingButton
                    sx={{ m: 2 }}
                    style={{
                        maxWidth: "150px",
                        maxHeight: "150px",
                        minWidth: "150px",
                        minHeight: "150px",
                    }}
                    loading={queueStatus === "30+30"}
                    onClick={() => Enqueue("30+30")}
                    variant="contained"
                    color="secondary"
                    disabled
                >
                    {" "}
                    30+30{<br />} Classical{" "}
                </LoadingButton>
                <LoadingButton
                    sx={{ m: 2 }}
                    style={{
                        maxWidth: "150px",
                        maxHeight: "150px",
                        minWidth: "150px",
                        minHeight: "150px",
                    }}
                    loading={queueStatus === "60+0"}
                    onClick={() => Enqueue("60+0")}
                    variant="contained"
                    color="secondary"
                >
                    {" "}
                    60+0{<br />} Classical{" "}
                </LoadingButton>
                <LoadingButton
                    sx={{ m: 2 }}
                    style={{
                        maxWidth: "150px",
                        maxHeight: "150px",
                        minWidth: "150px",
                        minHeight: "150px",
                    }}
                    loading={queueStatus === "60+60"}
                    onClick={() => Enqueue("60+60")}
                    variant="contained"
                    color="secondary"
                    disabled
                >
                    {" "}
                    60+60 {<br />}Classical{" "}
                </LoadingButton>
            </Grid>
            <Grid
                container
                spacing={0}
                alignItems="center"
                justifyContent="center"
            >
                <Grid item>
                    <IconButton
                        color="primary"
                        aria-label="Cancel Queue"
                        component="label"
                        disabled={queueStatus === -1}
                        onClick={Dequeue}
                        style={{}}
                    >
                        <CloseIcon
                            color="inherit"
                            style={{
                                maxWidth: "50px",
                                maxHeight: "50px",
                                minWidth: "50px",
                                minHeight: "50px",
                            }}
                        />{" "}
                    </IconButton>
                </Grid>
            </Grid>
        </Container>
    )
}

export default Matchmaking
