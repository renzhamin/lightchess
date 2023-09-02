import { useState, useEffect, useContext, forwardRef } from "react"
import axios from "axios"
import jwt_decode from "jwt-decode"
import { useHistory } from "react-router-dom"
import { AppContext } from "../App.js"
import { Chat } from "./Chat.js"
import LoadingButton from "@mui/lab/LoadingButton"
import {
    Table,
    Button,
    Typography,
    Container,
    CssBaseline,
    TableContainer,
    Paper,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Snackbar,
    IconButton,
    Grid,
} from "@mui/material"
import MuiAlert from "@mui/material/Alert"
import { useLocation } from "react-router-dom"
import { config } from "../config/config_env"
import CloseIcon from "@mui/icons-material/Close"

const Alert = forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
})

var myUsername
var username
var minEloDiff = 200
var myELO = 9999
var myInfo
var myTimeControl = "-1"
var inQueue = false
var receiver
var myColor
var queueStatus = -1

export const Matchmaking = () => {
    const location = useLocation()
    const history = useHistory()

    const [token, setToken] = useState("")
    const [expire, setExpire] = useState("")
    const [users, setUsers] = useState([])

    const [open, setOpen] = useState(location.openSnackbar)

    const {
        username,
        setUserName,
        socket,
        initSocket,
        initReady,
        updateUserList,
        updateReadyUserList,
        readyUserList,
    } = useContext(AppContext)

    const axiosJWT = axios.create()

    axiosJWT.interceptors.request.use(
        async (axiosConfig) => {
            const currentDate = new Date()
            if (expire * 1000 < currentDate.getTime()) {
                const response = await axios.get(`${config.backend}/api/token`)
                axiosConfig.headers.Authorization = `Bearer ${response.data.accessToken}`
                setToken(response.data.accessToken)
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
        refreshToken()
        getUsers()
    }, [])

    useEffect(() => {
        initSocket({ username })
        updateUserList()
    }, [username])

    const refreshToken = async () => {
        try {
            const response = await axios.get(`${config.backend}/api/token`)
            setToken(response.data.accessToken)
            const decoded = jwt_decode(response.data.accessToken)
            setUserName(decoded.username)
            setExpire(decoded.exp)
        } catch (error) {
            if (error.response) {
                history.push("/")
            }
        }
    }

    const getUsers = async () => {
        const response = await axiosJWT.get(`${config.backend}/api/users`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        initSocket({ username })
    }

    useEffect(() => {
        // fetchData()

        const interval = setInterval(() => {
            if (!myInfo) {
                axios
                    .get(`${config.backend}/api/user/` + username)
                    .then((data) => {
                        myInfo = data
                        myELO = myInfo.data.elo
                    })
            }

            updateUserList()
            updateReadyUserList()

            if (inQueue) {
                findOpponent()
            }
        }, 1000)

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
            clearInterval(interval)
        }
    }, [myInfo, myELO, readyUserList])

    const Challenge = () => {
        // e.preventDefault()
        Dequeue()
        initSocket({ username })
        socket.emit("Challenge", {
            to: receiver.username,
            msg: "challenge",
            yourcolor: myColor == 1 ? 0 : 1,
        })
        inQueue = false
        history.push(
            "/play/" + receiver.username + "/" + myColor + "/" + myTimeControl
        )
    }

    function findOpponent() {
        for (let i = 0; i < readyUserList.length; i++) {
            if (
                Math.abs(myELO - readyUserList[i].elo) <= minEloDiff &&
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
        myELO = myInfo?.data.elo
        initReady({ username, timeControl })
    }

    function Dequeue() {
        initSocket({ username })
        socket.emit("rmReady")
        inQueue = false
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
