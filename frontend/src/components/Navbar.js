import React, { useContext } from "react"
import axios from "axios"
import { useHistory } from "react-router-dom"
import { AppContext } from "../App.js"
import { AppBar, Toolbar, IconButton, Typography, Button } from "@mui/material"
import { config } from "../config/config_env"

const Navbar = () => {
    const { socket } = useContext(AppContext)
    const history = useHistory()

    const Logout = async () => {
        try {
            await axios.delete(`${config.backend}/api/logout`)
            history.push("/")
            socket.disconnect()
        } catch (error) {
            console.log(error)
        }
    }

    const Home = () => {
        history.push("/dashboard")
    }

    return (
        <React.Fragment>
            <AppBar position="static">
                <Toolbar variant="dense">
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
