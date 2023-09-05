import CloseIcon from "@mui/icons-material/Close"
import LoadingButton from "@mui/lab/LoadingButton"
import {
    Container,
    CssBaseline,
    Grid,
    IconButton,
    Typography,
} from "@mui/material"
import MuiAlert from "@mui/material/Alert"
import axios from "axios"
import { forwardRef, useContext, useEffect } from "react"
import { useHistory } from "react-router-dom"
import { AppContext } from "../App.js"
import { config } from "../config/config_env"

const Alert = forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
})

let myELO = 1200
let myInfo
let myTimeControl = "-1"
let inQueue = false
let receiver
let myColor
let queueStatus = -1

export const Quick_Game = () => {
    const history = useHistory()

    const { username, socket, initSocket, initReady, readyUserList } =
        useContext(AppContext)

    useEffect(() => {
        if (!myInfo && username) {
            axios.get(`${config.backend}/api/user/` + username).then((data) => {
                myInfo = data
                myELO = myInfo?.data.elo
            })
        }

        if (inQueue) {
            findOpponent()
        }

        socket.on("Challenge", (data) => {
            Dequeue()
            history.push(
                "/play/" +
                    data.from +
                    "/" +
                    data.yourcolor +
                    "/" +
                    myTimeControl
            )
            inQueue = false
        })

        return () => {
            socket.off("Challenge")
        }
    }, [readyUserList])

    const Challenge = () => {
        // e.preventDefault()
        initSocket({ username })
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
                initSocket({ username })
                socket.emit("rmReady")
            }
        }
    }

    function Enqueue(timeControl) {
        initSocket({ username })
        socket.emit("rmReady")
        inQueue = true
        if (queueStatus == timeControl) queueStatus = -1
        else queueStatus = timeControl
        myTimeControl = timeControl
        myELO = myInfo?.data?.elo
        initReady({ username, timeControl })
    }

    function Dequeue() {
        initSocket({ username })
        socket.emit("rmReady")
        inQueue = false
        queueStatus = -1
    }

    return (
        <Container component="main">
            <CssBaseline />
            <Typography variant="h4" sx={{ m: 2 }} align="center">
                Quick Game
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
                        maxWidth: "175px",
                        maxHeight: "200px",
                        minWidth: "175px",
                        minHeight: "200px",
                    }}
                    loading={queueStatus === "1+0"}
                    onClick={() => Enqueue("1+0")}
                    variant="contained"
                    color="secondary"
                >
                    {" "}
                    Bullet{" "}
                </LoadingButton>
                <LoadingButton
                    sx={{ m: 2 }}
                    style={{
                        maxWidth: "175px",
                        maxHeight: "200px",
                        minWidth: "175px",
                        minHeight: "200px",
                    }}
                    loading={queueStatus === "5+0"}
                    onClick={() => Enqueue("5+0")}
                    variant="contained"
                    color="secondary"
                >
                    {" "}
                    Blitz{" "}
                </LoadingButton>
                <LoadingButton
                    sx={{ m: 2 }}
                    style={{
                        maxWidth: "175px",
                        maxHeight: "200px",
                        minWidth: "175px",
                        minHeight: "200px",
                    }}
                    loading={queueStatus === "10+0"}
                    onClick={() => Enqueue("10+0")}
                    variant="contained"
                    color="secondary"
                >
                    {" "}
                    Rapid{" "}
                </LoadingButton>
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

export default Quick_Game
