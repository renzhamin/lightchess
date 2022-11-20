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
import Matchmaking from "./Matchmaking"
import Leaderboard from "./Leaderboard"
import UserCard from "./UserCard"
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
                <Grid>
                    <Grid item xs={6}>
                        <Matchmaking />
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        mt={5}
                        container
                        spacing={0}
                        direction="column"
                        alignItems="center"
                        justifyContent="center"
                    >
                        <Leaderboard />
                    </Grid>
                    <Grid item>
                        <UserCard />
                    </Grid>
                </Grid>
            </Container>
            <Copyright sx={{ mt: 8, mb: 4 }} />
        </>
    )
}

export default Home
