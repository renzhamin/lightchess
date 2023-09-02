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
    AlertTitle,
    Link,
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

const Dashboard = (props) => {
    const location = useLocation()
    const history = useHistory()

    const { username, setUserName } = useContext(AppContext)

    const [token, setToken] = useState("")
    const [expire, setExpire] = useState("")
    const [users, setUsers] = useState([])

    const [open, setOpen] = useState(location.openSnackbar)

    /* if (location.refresh == true) { */
    /*     window.location.reload() */
    /* } */

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
        updateUserList()
    }, [username])

    useEffect(() => {
        updateUserList()

        socket.on("Challenge_accepted", (data) => {
            history.push(
                "/play/" + data.from + "/" + data.yourcolor + "/" + timeFormat
            )
        })

        socket.on("Challenge_dashboard", (data) => {
            opponentUsername = data.challenger
            playingAgainst = data.from
            timeFormat = data.timeFormat
            handleClick()
        })

        return () => {
            socket.off("Challenge_dashboard")
            socket.off("Challenge_accepted")
        }
    }, [])

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

    const refreshToken = async () => {
        try {
            const response = await axiosJWT.get(`${config.backend}/api/token`)
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
        setUsers(response.data)
    }

    const Challenge_dashboard = (receiver) => {
        // e.preventDefault()
        initSocket({ username })
        socket.emit("Challenge_dashboard", {
            to: receiver.username,
            timeFormat: timeFormat,
            msg: "challenge",
            challenger: username,
            // yourcolor: myColor == 1 ? 0 : 1,
        })
        /* history.push("/play/" + receiver.id + "/" + myColor) */
    }

    const AcceptChallenge = (e) => {
        e.preventDefault()
        initSocket({ username })
        socket.emit("Challenge_accepted", {
            to: playingAgainst,
            msg: "challenge_accepted",
            yourcolor: myColor === 1 ? 0 : 1,
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
                    color="secondary"
                >
                    <AlertTitle>Challenge Received</AlertTitle>
                    Opponent: {opponentUsername}
                    <Grid>
                        <Button
                            color="success"
                            variant="contained"
                            onClick={AcceptChallenge}
                            sx={{ mt: 2, m: 1 }}
                        >
                            Accept
                        </Button>
                        <Button
                            color="error"
                            variant="contained"
                            onClick={handleClose}
                            sx={{ mt: 2, m: 1 }}
                        >
                            Reject
                        </Button>
                    </Grid>
                </Alert>
            </Snackbar>
            <Typography component="h1" variant="h5" sx={{ mt: 3 }}>
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
                            <TableCell>ELO</TableCell>
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
                                <TableCell>
                                    <Link
                                        underline="hover"
                                        onClick={() => {
                                            history.push(
                                                "/user/" + user.username
                                            )
                                            // history.go(0)
                                        }}
                                    >
                                        {user.username}
                                    </Link>
                                </TableCell>
                                <TableCell>
                                    <Typography sx={{ color: "#71A239" }}>
                                        ONLINE
                                    </Typography>
                                </TableCell>
                                <TableCell>{user.elo}</TableCell>
                                <TableCell>
                                    <IconButton
                                        disabled={user.username === username}
                                        onClick={() =>
                                            Challenge_dashboard(user)
                                        }
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
