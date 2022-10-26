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

const initSocket = (name) => {
    if (socket.connected === true || name === "") return
    socket.connect()
    console.log("Inited socket with", name, socket.id)
    socket.emit("name", name, (response) => {
        console.log(response)
    })
}

function App() {
    console.log("BACKEND URL", process.env.REACT_APP_BACKEND_URL)
    console.log(process.env)
    const [userMap, setUserMap] = useState(new Map())
    const [userList, setUserList] = useState([])

    const updateUserList = () => {
        socket.emit("getusers", "args", (usermap) => {
            let newUserMap = new Map(Object.entries(usermap))
            let users = []
            newUserMap.forEach((value, key) => {
                users.push({ id: key, name: value.name })
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
                        <Route path="/play/:id/:mycolor">
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
