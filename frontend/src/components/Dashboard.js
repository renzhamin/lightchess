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
} from "@mui/material"
import MuiAlert from "@mui/material/Alert"
import { useLocation } from "react-router-dom"
import { config } from "../config/config_env"

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

    const { initSocket, updateUserList } = useContext(AppContext)

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

    const handleClose = (event, reason) => {
        if (reason === "clickaway") {
            return
        }

        setOpen(false)
    }

    return (
        <Container component="main" alignItems="center">
            <CssBaseline />
            <Snackbar
                open={open}
                autoHideDuration={3000}
                onClose={handleClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                key={"bottomright"}
            >
                <Alert
                    onClose={handleClose}
                    severity="success"
                    sx={{ width: "100%" }}
                >
                    Logged in!
                </Alert>
            </Snackbar>
            <Typography component="h1" variant="h5" sx={{ mt: 1 }}>
                Welcome Back: {username}
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
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user, index) => (
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
                                <TableCell>{user.email}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Chat name={username} />
        </Container>
    )
}

export default Dashboard
