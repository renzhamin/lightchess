import { useState, forwardRef } from "react"
import axios from "axios"
import { useHistory, useLocation } from "react-router-dom"
import Button from "@mui/material/Button"
import CssBaseline from "@mui/material/CssBaseline"
import TextField from "@mui/material/TextField"
import Link from "@mui/material/Link"
import Grid from "@mui/material/Grid"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Container from "@mui/material/Container"
import Snackbar from "@mui/material/Snackbar"
import MuiAlert from "@mui/material/Alert"
import lightchess_logo_blue from "./static/images/lightchess_logo_blue.png"
import { config } from "../config"

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

const SignIn = () => {
    const history = useHistory()
    const location = useLocation()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [msg, setMsg] = useState("")
    const [open, setOpen] = useState(false)
    const [openSignUpSnackbar, setOpenSignUpSnackbar] = useState(
        location.openSnackbar
    )

    const Auth = async (e) => {
        e.preventDefault()
        try {
            await axios.post(`${config.backend}/api/login`, {
                email: email,
                password: password,
            })
            // history.push("/dashboard")
            history.push({
                pathname: "/dashboard",
                openSnackbar: true,
            })
        } catch (error) {
            setOpen(true)
            if (error.response) {
                setMsg(error.response.data.msg)
            }
        }
    }

    const handleClose = (event, reason) => {
        if (reason === "clickaway") {
            return
        }

        setOpen(false)
    }

    const handleSnackBarClose = (event, reason) => {
        if (reason === "clickaway") {
            return
        }

        setOpenSignUpSnackbar(false)
    }

    return (
        <Container component="main" maxWidth="xs">
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
                    severity="warning"
                    sx={{ width: "100%" }}
                >
                    {msg}
                </Alert>
            </Snackbar>
            <Snackbar
                open={openSignUpSnackbar}
                autoHideDuration={3000}
                onClose={handleSnackBarClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                key={"bottomright"}
            >
                <Alert
                    onClose={handleSnackBarClose}
                    severity="success"
                    sx={{ width: "100%" }}
                >
                    Sign up complete!
                </Alert>
            </Snackbar>
            <Box
                sx={{
                    marginTop: 8,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                <img
                    style={{ width: 150, height: 150 }}
                    src={lightchess_logo_blue}
                    alt="lightchess-logo"
                />
                <Typography component="h1" variant="h5" sx={{ mt: 1 }}>
                    Sign in
                </Typography>
                <Box component="form" onSubmit={Auth} noValidate sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        onChange={(e) => setEmail(e.target.value)}
                        autoFocus
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                    />
                    {/* <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Remember me"
            /> */}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Sign In
                    </Button>
                    <Grid container>
                        <Grid item xs>
                            <Link href="#" variant="body2">
                                Forgot password?
                            </Link>
                        </Grid>
                        <Grid item>
                            <Link href="#/register" variant="body2">
                                {"Don't have an account? Sign Up"}
                            </Link>
                        </Grid>
                    </Grid>
                </Box>
                {/* <Link
                    href={
                        config.backend +
                        "/api/login/federated/google"
                    }
                    variant="body2"
                    sx={{ mt: 2 }}
                >
                    {"Login with Google"}
                </Link> */}
            </Box>
            <Copyright sx={{ mt: 8, mb: 4 }} />
        </Container>
    )
}

export default SignIn
