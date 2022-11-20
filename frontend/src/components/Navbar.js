import React, { useContext } from "react"
import axios from "axios"
import { useHistory } from "react-router-dom"
import { AppContext } from "../App.js"
import { AppBar, Toolbar, IconButton, Typography, Button } from "@mui/material"
import { config } from "../config/config_env"
import lightchess_logo_grey from "./static/images/lightchess_logo_grey.png"

const Navbar = () => {
    const { socket } = useContext(AppContext)
    const history = useHistory()

    const Logout = async () => {
        try {
            await axios.delete(`${config.backend}/api/logout`)
            history.push({
                pathname: "/login",
                openLogoutSnackBar: true,
            })
            socket.disconnect()
        } catch (error) {
            console.log(error)
        }
    }

    const Home = () => {
        history.push("/")
    }

    return (
        <React.Fragment>
            <AppBar position="static">
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
                        sx={{ marginLeft: "left" }}
                        onClick={Home}
                    >
                        Home
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
