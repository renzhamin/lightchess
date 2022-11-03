import CssBaseline from "@mui/material/CssBaseline"
import { ThemeProvider } from "@mui/material/styles"
import React, { useState } from "react"
import { BrowserRouter, Route, Switch } from "react-router-dom"
import { io } from "socket.io-client"
import Board from "./components/Chessboard"
import Dashboard from "./components/Dashboard"
import Navbar from "./components/Navbar"
import PgnViewer from "./components/PgnViewer"
import SignIn from "./components/SignIn"
import SignUp from "./components/SignUp"
import theme from "./theme"

export const AppContext = React.createContext()

const socket = io(process.env.REACT_APP_WEB_SOCKET_URL, {
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
                <BrowserRouter>
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
                    </Switch>
                </BrowserRouter>
            </ThemeProvider>
        </AppContext.Provider>
    )
}

export default App
