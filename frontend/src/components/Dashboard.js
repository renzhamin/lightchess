/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useContext, forwardRef } from "react"
import axios from "axios"
import jwt_decode from "jwt-decode"
import { useHistory } from "react-router-dom"
import { AppContext } from "../App.js"
import { Chat } from "./Chat.js"
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
    Grid,
    IconButton,
} from "@mui/material"
import MuiAlert from "@mui/material/Alert"
import { useLocation } from "react-router-dom"
import { config } from "../config/config_env"
import CompareArrowsIcon from "@mui/icons-material/CompareArrows"

var timeControl = "5+0"
var playingAgainst
var opponentUsername
var timeFormat = "5+0"
var myColor

const Alert = forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
})

const Dashboard = () => {
    const location = useLocation()
    const history = useHistory()

    const { username, setUserName } = useContext(AppContext)

    const [token, setToken] = useState("")
    const [expire, setExpire] = useState("")
    const [users, setUsers] = useState([])

    const [open, setOpen] = useState(location.openSnackbar)

    const {
        socket,
        initSocket,
        initReady,
        userList,
        updateUserList,
        updateReadyUserList,
        readyUserList,
    } = useContext(AppContext)

    const handleClick = () => {
        setOpen(true)
    }

    const handleClose = (event, reason) => {
        if (reason === "clickaway") {
            return
        }

        setOpen(false)
    }

    useEffect(() => {
        refreshToken()
        getUsers()
        updateUserList()
    }, [])

    useEffect(() => {
        initSocket({ username })
        updateUserList()
    }, [username])

    useEffect(() => {
        initSocket({ username })
        updateUserList()

        console.log(username)

        socket.on("Challenge_accepted", (data) => {
            console.log(data)
            history.push(
                "/play/" + data.from + "/" + data.yourcolor + "/" + timeFormat
            )
            console.log("Challenge accepted")
        })

        socket.on("Challenge", (data) => {
            console.log("I WAS CHALLENGED")
            opponentUsername = data.challenger
            playingAgainst = data.from
            console.log("playing against", playingAgainst)
            timeFormat = data.timeFormat
            console.log(playingAgainst)
            handleClick()
        })

        return () => {
            socket.off("Challenge")
            socket.off("Challenge_accepted")
        }
    }, [])

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

    const axiosJWT = axios.create()

    axiosJWT.interceptors.request.use(
        async (config) => {
            const currentDate = new Date()
            if (expire * 1000 < currentDate.getTime()) {
                const response = await axios.get(`${config.backend}/api/token`)
                config.headers.Authorization = `Bearer ${response.data.accessToken}`
                setToken(response.data.accessToken)
                const decoded = jwt_decode(response.data.accessToken)
                setUserName(decoded.username)
                setExpire(decoded.exp)
            }
            return config
        },
        (error) => {
            return Promise.reject(error)
        }
    )

    const getUsers = async () => {
        const response = await axiosJWT.get(`${config.backend}/api/users`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        setUsers(response.data)
        initSocket({ username })
    }

    const Challenge = (receiver) => {
        console.log("Sending challenge to", receiver)
        // e.preventDefault()
        socket.emit("Challenge", {
            to: receiver.id,
            timeFormat: timeFormat,
            msg: "challenge",
            challenger: username,
            // yourcolor: myColor == 1 ? 0 : 1,
        })
        /* history.push("/play/" + receiver.id + "/" + myColor) */
    }

    const AcceptChallenge = (e) => {
        console.log("Challenge Accepted")
        e.preventDefault()
        console.log("At accept challenge ", playingAgainst)
        socket.emit("Challenge_accepted", {
            to: playingAgainst,
            msg: "challenge_accepted",
            yourcolor: myColor == 1 ? 0 : 1,
        })
        history.push(
            "/play/" + playingAgainst + "/" + myColor + "/" + timeFormat
        )
    }

    return (
        <Container component="main" alignItems="center">
            <CssBaseline />
            <Snackbar
                open={open}
                autoHideDuration={15000}
                onClose={handleClose}
            >
                <Alert
                    onClose={handleClose}
                    severity="info"
                    sx={{ width: "250%", height: "250%" }}
                >
                    Challenge Received from {opponentUsername}
                    <Grid>
                        <Button
                            color="success"
                            variant="contained"
                            onClick={AcceptChallenge}
                            sx={{ m: 1 }}
                        >
                            Accept
                        </Button>
                        <Button
                            color="error"
                            variant="contained"
                            onClick={handleClose}
                            sx={{ m: 1 }}
                        >
                            Reject
                        </Button>
                    </Grid>
                </Alert>
            </Snackbar>
            <Typography component="h1" variant="h5" sx={{ mt: 1 }}>
                Online Players
            </Typography>
            <Button
                size="large"
                sx={{ mt: 3, mb: 2 }}
                onClick={getUsers}
                variant="contained"
                alignItems="center"
            >
                Refresh
            </Button>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>No</TableCell>
                            <TableCell>Username</TableCell>
                            <TableCell>Status</TableCell>
                            {/* <TableCell>ELO</TableCell> */}
                            <TableCell>Challenge</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {userList.map((user, index) => (
                            <TableRow
                                key={user.id}
                                sx={{
                                    "&:last-child td, &:last-child th": {
                                        border: 0,
                                    },
                                }}
                            >
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{user.username}</TableCell>
                                <TableCell>ONLINE</TableCell>
                                {/* <TableCell>{user.elo}</TableCell> */}
                                <TableCell>
                                    <IconButton
                                        disabled={user.username == username}
                                        onClick={() => Challenge(user)}
                                    >
                                        <CompareArrowsIcon></CompareArrowsIcon>
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    )
}

export default Dashboard
