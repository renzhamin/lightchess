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
} from "@mui/material"
import MuiAlert from "@mui/material/Alert"
import { useLocation } from "react-router-dom"
import { config } from "../config/config_env"
import CloseIcon from "@mui/icons-material/Close"
import Matchmaking from "./Matchmaking"
import Leaderboard from "./Leaderboard"

export const Home = () => {
    return (
        <Container component="main">
            <CssBaseline />
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
            </Grid>
        </Container>
    )
}

export default Home
