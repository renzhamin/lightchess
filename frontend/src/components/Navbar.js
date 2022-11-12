import React, { useContext } from "react"
import axios from "axios"
import { useHistory } from "react-router-dom"
import { AppContext } from "../App.js"
import { AppBar, Toolbar, IconButton, Typography, Button } from "@mui/material"
import { config } from "../config"

const Navbar = () => {
    const { socket } = useContext(AppContext)
    const history = useHistory()

    const Logout = async () => {
        try {
            await axios.delete(
                `${config.backend}/api/logout`
            )
            history.push("/")
            socket.disconnect()
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <React.Fragment>
            <AppBar position="static">
                <Toolbar variant="dense">
                    <Button
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
