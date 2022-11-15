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
import { config } from "./config"

export const AppContext = React.createContext()

const socket = io(config.backend_ws, {
    autoConnect: false,
})

const initSocket = (args) => {
    const { username, userId } = args
    if (socket.connected === true || username === "") return
    socket.connect()
    socket.emit("initSocket", { username, userId }, (response) => {
        console.log(response)
    })
}
function App() {
    const [userMap, setUserMap] = useState(new Map())
    const [userList, setUserList] = useState([])
    const [userId, setUserId] = useState(-1)
    const [username, setUserName] = useState("")

    const updateUserList = () => {
        socket.emit("getusers", "args", (usermap) => {
            let newUserMap = new Map(Object.entries(usermap))
            let users = []
            newUserMap.forEach((value, key) => {
                users.push({
                    id: key,
                    username: value.username,
                    userId: value.userId,
                })
            })
            setUserMap(newUserMap)
            setUserList([...users])
        })
    }

    useEffect(() => {
        const interval = setInterval(() => {
            updateUserList()
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
                socket,
                initSocket,
                userId,
                username,
                setUserName,
                setUserId,
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
                            <Profile/>
                        </Route>
                    </Switch>
                </HashRouter>
            </ThemeProvider>
        </AppContext.Provider>
    )
}

export default App
