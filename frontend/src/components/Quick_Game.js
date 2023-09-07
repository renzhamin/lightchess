import CloseIcon from "@mui/icons-material/Close"
import LoadingButton from "@mui/lab/LoadingButton"
import {
    Container,
    CssBaseline,
    Grid,
    IconButton,
    Typography,
} from "@mui/material"
import axios from "axios"
import jwt_decode from "jwt-decode"
import { useContext, useEffect, useState } from "react"
import { useHistory } from "react-router-dom"
import { AppContext } from "../App.js"
import { config } from "../config/config_env"

let myELO = 1200
let myInfo
let myTimeControl = "-1"
let inQueue = false
let receiver
let myColor
let queueStatus = -1

export const Quick_Game = () => {
    const history = useHistory()
    const [expire, setExpire] = useState(1)

    const { username, socket, initReady, readyUserList, setUserName } =
        useContext(AppContext)

    const axiosJWT = axios.create()

    axiosJWT.interceptors.request.use(
        async (axiosConfig) => {
            const currentDate = new Date()
            if (expire * 1000 < currentDate.getTime()) {
                const response = await axios.get(`${config.backend}/api/token`)
                axiosConfig.headers.Authorization = `Bearer ${response.data.accessToken}`
                const decoded = jwt_decode(response.data.accessToken)
                setUserName(decoded.username)
                setExpire(decoded.exp)
            }
            return axiosConfig
        },
        (error) => {
            return Promise.reject(error)
        }
    )

    useEffect(() => {
        if (!myInfo && username) {
            axiosJWT
                .get(`${config.backend}/api/user/` + username)
                .then((data) => {
                    myInfo = data
                    myELO = myInfo?.data.elo
                })
        }
    }, [])

    useEffect(() => {
        if (inQueue) {
            findOpponent()
        }
    }, [readyUserList])

    useEffect(() => {
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
            inQueue = false
            ack("success")
        })

        return () => {
            socket.off("Challenge")
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
        socket.emit("rmReady")
        inQueue = true
        if (queueStatus == timeControl) queueStatus = -1
        else queueStatus = timeControl
        myTimeControl = timeControl
        myELO = myInfo?.data?.elo
        initReady({ username, timeControl })
    }

    function Dequeue() {
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
