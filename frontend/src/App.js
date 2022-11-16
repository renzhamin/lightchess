import CssBaseline from "@mui/material/CssBaseline"
import { ThemeProvider } from "@mui/material/styles"
import React, { useEffect, useState } from "react"
import { HashRouter, Route, Switch } from "react-router-dom"
import { io } from "socket.io-client"
import Board from "./components/Chessboard"
import Dashboard from "./components/Dashboard"
import Navbar from "./components/Navbar"
import PgnViewer from "./components/PgnViewer"
import SignIn from "./components/SignIn"
import SignUp from "./components/SignUp"
import theme from "./theme"
import Profile from "./components/Profile"
import { config } from "./config/config_env"

export const AppContext = React.createContext()

const socket = io(config.backend_ws, {
    autoConnect: false,
})

const initSocket = (args) => {
    const { username } = args
    if (socket.connected === true || username === "") return
    socket.connect()
    socket.emit("initSocket", { username }, (response) => {
        console.log(response)
    })
}
const initReady = (args) => {
    const { username } = args
    if (username === "") return
    if (socket.disconnected) {
        initSocket({ username })
    }
    socket.emit("initReady", { username }, (response) => {
        console.log(response)
    })
}

function App() {
    const [userMap, setUserMap] = useState(new Map())
    const [userList, setUserList] = useState([])
    const [readyUserMap, setReadyUserMap] = useState(new Map())
    const [readyUserList, setReadyUserList] = useState([])
    const [username, setUserName] = useState("")

    const updateUserList = () => {
        socket.emit("getusers", "args", (usermap) => {
            let newUserMap = new Map(Object.entries(usermap))
            let users = []
            newUserMap.forEach((value, key) => {
                users.push({
                    id: key,
                    username: value.username,
                })
            })
            setUserMap(newUserMap)
            setUserList([...users])
        })
    }
    const updateReadyUserList = () => {
        socket.emit("get_readyusers", "args", (usermap) => {
            let newReadyMap = new Map(Object.entries(usermap))
            let users = []
            newReadyMap.forEach((value, key) => {
                users.push({
                    id: key,
                    ...value,
                })
            })
            setReadyUserMap(newReadyMap)
            setReadyUserList([...users])
        })
    }

    useEffect(() => {
        const interval = setInterval(() => {
            updateUserList()
            updateReadyUserList()
        }, 2000)
        return () => {
            clearInterval(interval)
        }
    })

    return (
        <AppContext.Provider
            value={{
                userMap,
                userList,
                updateUserList,
                readyUserMap,
                readyUserList,
                updateReadyUserList,
                socket,
                initSocket,
                initReady,
                username,
                setUserName,
            }}
        >
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <HashRouter>
                    <Switch>
                        <Route exact path="/">
                            <SignIn />
                        </Route>
                        <Route exact path="/login">
                            <SignIn />
                        </Route>
                        <Route path="/register">
                            <SignUp />
                        </Route>
                        <Route path="/dashboard">
                            <Navbar />
                            <Dashboard />
                        </Route>
                        <Route path="/pgnviewer">
                            <Navbar />
                            <PgnViewer />
                        </Route>
                        <Route path="/play/:opponent_socket_id/:mycolor">
                            <Navbar />
                            <Board />
                        </Route>
                        <Route path="/play">
                            <Navbar />
                            <Board />
                        </Route>
                        <Route path="/user/:username">
                            <Navbar />
                            <Profile />
                        </Route>
                    </Switch>
                </HashRouter>
            </ThemeProvider>
        </AppContext.Provider>
    )
}

export default App
