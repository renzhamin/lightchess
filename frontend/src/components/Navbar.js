import { AppBar, Button, Toolbar, Typography } from "@mui/material"
import axios from "axios"
import React, { useContext } from "react"
import { useHistory } from "react-router-dom"
import { AppContext } from "../App.js"
import { config } from "../config/config_env"
import lightchess_logo_grey from "./static/images/lightchess_logo_grey.png"

const Navbar = () => {
    const { socket, setUserName } = useContext(AppContext)
    const history = useHistory()

    const Logout = async () => {
        try {
            setUserName("")
            socket.emit("rmReady")
            socket.disconnect()
            await axios.delete(`${config.backend}/api/logout`)
            history.push({
                pathname: "/login",
                openLogoutSnackBar: true,
            })
            history.go(0)
        } catch (error) {
            console.error(error)
        }
    }

    const Home = () => {
        history.push({ pathname: "/", refresh: true })
    }

    const Dashboard = () => {
        history.push({ pathname: "/dashboard", refresh: true })
    }

    const PGNViewer = () => {
        history.push("/pgnviewer")
    }

    const Matchmaking = () => {
        history.push("/matchmaking")
    }

    return (
        <React.Fragment>
            <AppBar position="static" color="secondary">
                <Toolbar variant="dense">
                    <img
                        style={{ width: 50, height: 50 }}
                        src={lightchess_logo_grey}
                        alt="lightchess-logo"
                    />
                    <Typography
                        variant="h6"
                        noWrap
                        component="a"
                        href="/"
                        sx={{
                            mr: 2,
                            display: { xs: "none", md: "flex" },
                            // fontFamily: "monospace",
                            fontWeight: 300,
                            letterSpacing: ".1rem",
                            color: "inherit",
                            textDecoration: "none",
                        }}
                    >
                        LIGHTCHESS
                    </Typography>
                    <Button
                        color="inherit"
                        variant="text"
                        sx={{ marginLeft: "left", mx: 2 }}
                        onClick={Home}
                    >
                        Home
                    </Button>
                    <Button
                        color="inherit"
                        variant="text"
                        sx={{ marginLeft: "left", mx: 2 }}
                        onClick={Dashboard}
                    >
                        Dashboard
                    </Button>
                    <Button
                        color="inherit"
                        variant="text"
                        sx={{ marginLeft: "left", mx: 2 }}
                        onClick={PGNViewer}
                    >
                        PGNViewer
                    </Button>
                    <Button
                        color="inherit"
                        variant="text"
                        sx={{ marginLeft: "left", mx: 2 }}
                        onClick={Matchmaking}
                    >
                        Matchmaking
                    </Button>
                    <Button
                        color="inherit"
                        variant="outlined"
                        sx={{ marginLeft: "auto" }}
                        onClick={Logout}
                    >
                        Log Out
                    </Button>
                </Toolbar>
            </AppBar>
        </React.Fragment>
    )
}

export default Navbar
