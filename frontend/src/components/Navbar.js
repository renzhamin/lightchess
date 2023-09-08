import MenuIcon from "@mui/icons-material/Menu"
import { AppBar, Button, Toolbar, Typography } from "@mui/material"
import Box from "@mui/material/Box"
import Drawer from "@mui/material/Drawer"
import IconButton from "@mui/material/IconButton"
import axios from "axios"
import React from "react"
import { useHistory } from "react-router-dom"
import { AppContext } from "../App.js"
import { config } from "../config/config_env"
import lightchess_logo_grey from "./static/images/lightchess_logo_grey.png"

const links = [
    {
        name: "Home",
        path: "/",
    },
    {
        name: "Dashboard",
        path: "/dashboard",
    },
    {
        name: "PgnViewer",
        path: "/pgnviewer",
    },
    {
        name: "Matchmaking",
        path: "/matchmaking",
    },
]

const Navbar = () => {
    const { socket, setUserName } = React.useContext(AppContext)
    const history = useHistory()
    const [mobileOpen, setMobileOpen] = React.useState(false)

    const handleDrawerToggle = () => {
        setMobileOpen((prevState) => !prevState)
    }

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
            /* history.go(0) */
        } catch (error) {
            console.error(error)
        }
    }

    const drawer = (
        <Box
            onClick={handleDrawerToggle}
            sx={{
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
            }}
            color="primary"
            height={"100%"}
        >
            {links.map((link, index) => (
                <Button
                    color="inherit"
                    variant="text"
                    sx={{ marginTop: index == 0 ? "auto" : "1" }}
                    onClick={() => history.push(link.path)}
                >
                    {link.name}
                </Button>
            ))}
            <Button
                color="inherit"
                variant="outlined"
                onClick={Logout}
                sx={{ marginTop: "auto", marginBottom: 2 }}
            >
                Log Out
            </Button>
        </Box>
    )

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
                    <a href="/">
                        <img
                            style={{ width: 50, height: 50 }}
                            src={lightchess_logo_grey}
                            alt="lightchess-logo"
                        />
                    </a>
                    <Typography
                        variant="h6"
                        noWrap
                        component="a"
                        href="/"
                        sx={{
                            mr: 2,
                            // fontFamily: "monospace",
                            fontWeight: 300,
                            letterSpacing: ".1rem",
                            color: "inherit",
                            textDecoration: "none",
                        }}
                    >
                        LIGHTCHESS
                    </Typography>
                    {links.map((link) => {
                        return (
                            <Button
                                color="inherit"
                                variant="text"
                                sx={{
                                    mx: 2,
                                    display: { xs: "none", md: "block" },
                                }}
                                onClick={() => history.push(link.path)}
                            >
                                {link.name}
                            </Button>
                        )
                    })}
                    <Button
                        color="inherit"
                        variant="outlined"
                        sx={{
                            marginLeft: "auto",
                            display: { xs: "none", md: "block" },
                        }}
                        onClick={Logout}
                    >
                        Log Out
                    </Button>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{
                            marginLeft: "auto",
                            display: { md: "none" },
                        }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Drawer
                        anchor="right"
                        variant="temporary"
                        open={mobileOpen}
                        onClose={handleDrawerToggle}
                        ModalProps={{
                            keepMounted: true,
                        }}
                        sx={{
                            display: { xs: "block", md: "none" },
                            "& .MuiDrawer-paper": {
                                boxSizing: "border-box",
                                backgroundColor: "#E1FAFD",
                            },
                        }}
                    >
                        {drawer}
                    </Drawer>
                </Toolbar>
            </AppBar>
        </React.Fragment>
    )
}

export default Navbar
