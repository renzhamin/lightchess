/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useContext } from "react"
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
} from "@mui/material"

const Dashboard = () => {
    const { userId, setUserId } = useContext(AppContext)
    const [name, setName] = useState("")

    const [token, setToken] = useState("")
    const [expire, setExpire] = useState("")
    const [users, setUsers] = useState([])
    const history = useHistory()

    const { initSocket, updateUserList } = useContext(AppContext)

    useEffect(() => {
        refreshToken()
        getUsers()
        const interval = setInterval(() => {
            updateUserList()
        }, 2000)

        return () => {
            clearInterval(interval)
        }
    }, [])

    useEffect(() => {
        initSocket({ name, userId })
        updateUserList()
    }, [userId, name])

    const refreshToken = async () => {
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_BACKEND_URL}/api/token`
            )
            setToken(response.data.accessToken)
            const decoded = jwt_decode(response.data.accessToken)
            setName(decoded.name)
            setUserId(decoded.id)
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
                const response = await axios.get(
                    `${process.env.REACT_APP_BACKEND_URL}/api/token`
                )
                config.headers.Authorization = `Bearer ${response.data.accessToken}`
                setToken(response.data.accessToken)
                const decoded = jwt_decode(response.data.accessToken)
                setName(decoded.name)
                setExpire(decoded.exp)
            }
            return config
        },
        (error) => {
            return Promise.reject(error)
        }
    )

    const getUsers = async () => {
        const response = await axiosJWT.get(
            `${process.env.REACT_APP_BACKEND_URL}/api/users`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        )
        setUsers(response.data)
        initSocket({ name, userId })
    }

    return (
        <Container component="main" alignItems="center">
            <CssBaseline />
            <Typography component="h1" variant="h5" sx={{ mt: 1 }}>
                Welcome Back: {name}
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
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Chat name={name} />
        </Container>
    )
}

export default Dashboard
