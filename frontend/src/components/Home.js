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
import { config } from "../config/config_env"
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
            <Link
                color="inherit"
                href="https://github.com/renzhamin/lightchess"
            >
                renzhamin
            </Link>{" "}
            {new Date().getFullYear()}
            {"."}
        </Typography>
    )
}

export const Home = () => {
    const location = useLocation()
    const [open, setOpen] = useState(location.openSnackbar)
    const { username, axiosJWT } = useContext(AppContext)

    useEffect(() => {
        const init = async () => {
            if (!username) {
                await axiosJWT.get(`${config.backend}/api/health`)
            }
        }

        init()
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
                <Grid container mt={3}>
                    <Grid
                        item
                        xs={12}
                        sm={8}
                        spacing={0}
                        direction="row"
                        alignItems="center"
                        justifyContent="center"
                    >
                        <Quick_Game />
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        sm={4}
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
                        xs={12}
                        sm={6}
                        mt={5}
                        container
                        spacing={0}
                        direction="column"
                        justifyContent="center"
                        alignItems="center"
                    >
                        <img
                            style={{ width: 250 }}
                            src={lightchess_logo_blue}
                            alt="lightchess-logo"
                        />
                        {/* <Typography>
                            Number of online users {userList.length}
                        </Typography> */}
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        sm={6}
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
            <Copyright sx={{ mt: 8 }} />
        </>
    )
}

export default Home
