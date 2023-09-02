import CssBaseline from "@mui/material/CssBaseline"
import { ThemeProvider } from "@mui/material/styles"
import React, { useEffect, useState, Component } from "react"
import { HashRouter, Route, Switch, Redirect } from "react-router-dom"
import { io } from "socket.io-client"
import Board from "./components/Chessboard"
import Dashboard from "./components/Dashboard"
import Navbar from "./components/Navbar"
import PgnViewer from "./components/PgnViewer"
import SignIn from "./components/SignIn"
import SignUp from "./components/SignUp"
import { themeLight, themeDark } from "./theme"
import Home from "./components/Home"
import Profile from "./components/Profile"
import { config } from "./config/config_env"
import { hasValidRefreshToken } from "./utils/cookies"
import NotFound from "./components/NotFound"
import Matchmaking from "./components/Matchmaking"
import ForgotPassword from "./components/ForgotPassword"
import lightchess_logo_grey from "./components/static/images/lightchess_logo_grey.png"

export const AppContext = React.createContext()

const socket = io(config.backend, {
    autoConnect: false,
})

const initSocket = (args) => {
    const { username } = args
    if (socket.connected || username === "") return
    socket.connect()
    socket.emit("initSocket", { username }, (response) => {})
}
const initReady = (args) => {
    const { username } = args
    if (username === "") return
    if (socket.disconnected) {
        initSocket({ username })
    }
    socket.emit("initReady", args, (response) => {})
}

class ProtectedRoute extends Component {
    render() {
        const { component: Component, ...props } = this.props
        return (
            <Route
                {...props}
                render={(props) =>
                    hasValidRefreshToken() ? (
                        <>
                            <Navbar />
                            <Component {...props} />
                        </>
                    ) : (
                        <Redirect to="/login" />
                    )
                }
            />
        )
    }
}

function App() {
    const [userMap, setUserMap] = useState(new Map())
    const [userList, setUserList] = useState([])
    const [readyUserMap, setReadyUserMap] = useState(new Map())
    const [readyUserList, setReadyUserList] = useState([])
    const [username, setUserName] = useState("")

    const updateUserList = () => {
        initSocket({ username })
        socket.emit("getusers", "args", (usermap) => {
            let newUserMap = new Map(Object.entries(usermap))
            let users = []
            newUserMap.forEach((value, key) => {
                users.push({
                    id: key,
                    ...value,
                })
            })
            setUserMap(newUserMap)
            setUserList([...users])
        })
    }
    const updateReadyUserList = () => {
        initSocket({ username })
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
            <ThemeProvider theme={themeLight}>
                <CssBaseline />
                <div
                    style={{
                        backgroundImage: lightchess_logo_grey,
                    }}
                >
                    <HashRouter>
                        <Switch>
                            <Route
                                path="/notfound"
                                component={NotFound}
                                refresh="true"
                            ></Route>

                            <Route exact path="/login">
                                <SignIn />
                            </Route>
                            <Route path="/register">
                                <SignUp />
                            </Route>
                            <Route exact path="/forgotpassword">
                                <ForgotPassword />
                            </Route>
                            <ProtectedRoute
                                path="/dashboard"
                                component={Dashboard}
                                refresh="true"
                            />
                            <ProtectedRoute
                                path="/pgnviewer"
                                component={PgnViewer}
                            />
                            <ProtectedRoute
                                path="/matchmaking"
                                component={Matchmaking}
                            />
                            <ProtectedRoute
                                path="/play/:opponentUserName/:mycolor/:time_format"
                                component={Board}
                            />
                            <ProtectedRoute path="/play" component={Board} />
                            <ProtectedRoute
                                path="/user/:username"
                                component={Profile}
                            />
                            <ProtectedRoute path="/" component={Home} />
                        </Switch>
                    </HashRouter>
                </div>
            </ThemeProvider>
        </AppContext.Provider>
    )
}

export default App
