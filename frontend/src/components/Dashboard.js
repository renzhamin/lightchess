/* eslint-disable react-hooks/exhaustive-deps */
import CompareArrowsIcon from "@mui/icons-material/CompareArrows"
import {
    AlertTitle,
    Button,
    Container,
    CssBaseline,
    Grid,
    IconButton,
    Link,
    Paper,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material"
import MuiAlert from "@mui/material/Alert"
import { forwardRef, useContext, useEffect, useState } from "react"
import { useHistory, useLocation } from "react-router-dom"
import { AppContext } from "../App.js"

let playingAgainst
let opponentUsername
let timeFormat = "5+0"
let myColor

const Alert = forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
})

const Dashboard = () => {
    const location = useLocation()
    const history = useHistory()

    const { username } = useContext(AppContext)

    const [open, setOpen] = useState(location.openSnackbar)

    const { socket, initSocket, updateUserList, userList } =
        useContext(AppContext)

    const handleClick = () => {
        setOpen(true)
    }

    const handleClose = (_, reason) => {
        if (reason === "clickaway") {
            return
        }

        setOpen(false)
    }

    useEffect(() => {
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

    const Challenge_dashboard = (receiver) => {
        initSocket({ username })
        socket.emit("Challenge_dashboard", {
            to: receiver.username,
            timeFormat: timeFormat,
            msg: "challenge",
            challenger: username,
        })
    }

    const AcceptChallenge = (e) => {
        e.preventDefault()
        initSocket({ username })
        socket.emit(
            "Challenge_accepted",
            {
                to: playingAgainst,
                msg: "challenge_accepted",
                yourcolor: myColor === 1 ? 0 : 1,
            },
            (res) => {
                if (res !== "success") return
                history.push(
                    "/play/" + playingAgainst + "/" + myColor + "/" + timeFormat
                )
            }
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
                onClick={() => updateUserList()}
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
