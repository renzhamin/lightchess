import { useState, useEffect, useContext, forwardRef } from "react"
import axios from "axios"
import jwt_decode from "jwt-decode"
import { useHistory } from "react-router-dom"
import { AppContext } from "../App.js"
import { Chat } from "./Chat.js"
import LoadingButton from "@mui/lab/LoadingButton"
import {
    Table,
    Button,
    Typography,
    Container,
    CssBaseline,
    TableContainer,
    Paper,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Snackbar,
    IconButton,
    Grid,
    Link,
} from "@mui/material"
import MuiAlert from "@mui/material/Alert"
import { useLocation } from "react-router-dom"
import { config } from "../config/config_env"
import CloseIcon from "@mui/icons-material/Close"
import Quick_Game from "./Quick_Game"
import Matchmaking from "./Matchmaking"
import Leaderboard from "./Leaderboard"
import UserCard from "./UserCard"
import lightchess_logo_blue from "./static/images/lightchess_logo_blue.png"
const Alert = forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
})

function Copyright(props) {
    return (
        <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            {...props}
        >
            {"Copyright © "}
            <Link color="inherit" href="https://github.com/l1ghtweight/">
                Lightweight
            </Link>{" "}
            {new Date().getFullYear()}
            {"."}
        </Typography>
    )
}

export const Home = () => {
    const location = useLocation()
    /* if (location.refresh == true) { */
    /*     window.location.reload() */
    /* } */
    const [open, setOpen] = useState(location.openSnackbar)
    const handleClose = (event, reason) => {
        if (reason === "clickaway") {
            return
        }

        setOpen(false)
    }
    return (
        <>
            <Container component="main">
                <CssBaseline />

                <Snackbar
                    open={open}
                    autoHideDuration={3000}
                    onClose={handleClose}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    key={"bottomright"}
                >
                    <Alert
                        onClose={handleClose}
                        severity="success"
                        sx={{ width: "100%" }}
                    >
                        Logged in!
                    </Alert>
                </Snackbar>
                <Grid container spacing={2} mt={3}>
                    <Grid
                        item
                        xs={8}
                        // mt={5}
                        container
                        spacing={0}
                        direction="row"
                        alignItems="center"
                        justifyContent="center"
                    >
                        <Quick_Game />
                    </Grid>
                    <Grid
                        item
                        xs={4}
                        // mt={5}
                        container
                        spacing={0}
                        direction="column"
                        alignItems="center"
                        justifyContent="center"
                    >
                        <UserCard />
                    </Grid>
                </Grid>
                <Grid
                    container
                    spacing={0}
                    alignItems="center"
                    justifyContent="center"
                    mt={5}
                >
                    <Grid
                        item
                        xs={8}
                        mt={5}
                        container
                        spacing={0}
                        direction="column"
                        justifyContent="center"
                        alignItems="center"
                    >
                        <img
                            style={{ width: 250, height: 250 }}
                            src={lightchess_logo_blue}
                            alt="lightchess-logo"
                        />
                        {/* <Typography>
                            Number of online users {userList.length}
                        </Typography> */}
                    </Grid>
                    <Grid
                        item
                        xs={4}
                        mt={5}
                        container
                        spacing={0}
                        direction="column"
                        alignItems="center"
                        justifyContent="center"
                    >
                        <Leaderboard />
                    </Grid>
                </Grid>
            </Container>
            <Copyright sx={{ mt: 8, mb: 4 }} />
        </>
    )
}

export default Home
