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
import axios from "axios"
import jwt_decode from "jwt-decode"

export const AppContext = React.createContext()

let socket

if (process.env.NODE_ENV === "development") {
    socket = io(config.backend, {
        rememberUpgrade: true,
        autoConnect: false,
    })
} else {
    socket = io({
        rememberUpgrade: true,
        autoConnect: false,
    })
}

const initSocket = (args) => {
    const { username } = args
    if (!username || username.length == 0 || socket.connected) return
    socket.connect()
    socket.emit("initSocket", { username })
}

const initReady = (args) => {
    const { username } = args
    if (username === "") return
    if (socket.disconnected) {
        initSocket({ username })
    }
    socket.emit("initReady", args)
}

class ProtectedRoute extends Component {
    render() {
        const { component: Component, path, ...props } = this.props
        return (
            <Route
                {...props}
                render={(props) =>
                    hasValidRefreshToken() ? (
                        <>
                            {!path?.startsWith("/play") && <Navbar />}
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

const axiosJWT = axios.create()
let access_token = ""
let expire = 0
let username = ""

function App() {
    const [userList, setUserList] = useState([])
    const [readyUserList, setReadyUserList] = useState([])
    function setUserName(user) {
        if (user) username = user
    }

    axiosJWT.interceptors.request.use(
        async (axiosConfig) => {
            const currentDate = new Date()
            if (
                !access_token ||
                Number(expire) * 1000 < currentDate.getTime()
            ) {
                const response = await axios.get(`${config.backend}/api/token`)
                access_token = response.data.accessToken
                const decoded = await jwt_decode(access_token)
                if (!username) {
                    setUserName(decoded.username)
                }
                expire = decoded.exp
            }
            axiosConfig.headers.Authorization = `Bearers ${access_token}`
            return axiosConfig
        },
        (error) => {
            return Promise.reject(error)
        }
    )

    const updateUserList = () => {
        socket.emit("getusers", "args", (usermap) => {
            let newUserMap = new Map(Object.entries(usermap))
            let users = []
            newUserMap.forEach((value, key) => {
                users.push({
                    id: key,
                    ...value,
                })
            })
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
            setReadyUserList([...users])
        })
    }

    useEffect(() => {
        const interval = setInterval(() => {
            if (username) {
                initSocket({ username })
                updateReadyUserList()
            }
        }, 2000)

        return () => {
            clearInterval(interval)
        }
    }, [])

    return (
        <AppContext.Provider
            value={{
                userList,
                updateUserList,
                readyUserList,
                updateReadyUserList,
                socket,
                initSocket,
                initReady,
                username,
                setUserName,
                axiosJWT,
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
                            <ProtectedRoute
                                path="/play"
                                component={Board}
                                hasNav={false}
                            />
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
