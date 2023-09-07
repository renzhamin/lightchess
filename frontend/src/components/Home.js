import {
    Container,
    CssBaseline,
    Grid,
    Link,
    Snackbar,
    Typography,
} from "@mui/material"
import MuiAlert from "@mui/material/Alert"
import { forwardRef, useContext, useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import { AppContext } from "../App"
import Leaderboard from "./Leaderboard"
import Quick_Game from "./Quick_Game"
import lightchess_logo_blue from "./static/images/lightchess_logo_blue.png"
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
    const { socket, initSocket, username } = useContext(AppContext)

    useEffect(() => {
        socket.on("disconnect", () => {
            initSocket({ username })
        })

        return () => {
            socket.off("disconnect")
        }
    }, [])

    const handleClose = (_, reason) => {
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
