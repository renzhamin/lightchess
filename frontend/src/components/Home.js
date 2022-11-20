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

var myUsername
var username
var minEloDiff = 200
var myELO = 9999
var myInfo
var myTimeControl = "-1"
var inQueue = false
var receiver
var myColor

export const Home = () => {
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
                        console.log("Fetching data")
                        myInfo = data
                        myELO = myInfo.data.elo
                    })
            }

            updateUserList()
            updateReadyUserList()

            if (inQueue) {
                console.log("Trying to find opponent")
                findOpponent()
            }
        }, 1000)

        socket.on("Challenge", (data) => {
            console.log(data)
            history.push(
                "/play/" +
                    data.from +
                    "/" +
                    data.yourcolor +
                    "/" +
                    myTimeControl
            )
            console.log("Challenge accepted")
            inQueue = false
        })

        return () => {
            socket.off("Challenge")
            clearInterval(interval)
        }
    }, [myInfo, myELO, readyUserList])

    const Challenge = () => {
        console.log("Sending challenge")
        // e.preventDefault()
        socket.emit("Challenge", {
            to: receiver.id,
            msg: "challenge",
            yourcolor: myColor == 1 ? 0 : 1,
        })
        inQueue = false
        history.push(
            "/play/" + receiver.id + "/" + myColor + "/" + myTimeControl
        )
    }

    function findOpponent() {
        for (let i = 0; i < readyUserList.length; i++) {
            if (
                Math.abs(myELO - readyUserList[i].elo) <= minEloDiff &&
                myTimeControl === readyUserList[i].timeControl &&
                username != readyUserList[i].username
            ) {
                console.log("Can match with ", readyUserList[i].username)
                myColor = Math.floor(Math.random() * 2)
                receiver = readyUserList[i]
                Challenge()
            }
        }
    }

    function Enqueue(timeControl) {
        inQueue = true
        myTimeControl = timeControl
        console.log("Placing in queue")
        myELO = myInfo.data.elo
        initReady({ username, timeControl })
        console.log(myELO, myTimeControl)
        for (let i = 0; i < readyUserList.length; i++)
            console.log(
                readyUserList[i].username,
                readyUserList[i].elo,
                readyUserList[i].timeControl
            )
    }

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <Button onClick={() => Enqueue("5+0")}> 5+0 </Button>
            <Button onClick={() => Enqueue("10+0")}> 10+0 </Button>
        </Container>
    )
}

export default Home