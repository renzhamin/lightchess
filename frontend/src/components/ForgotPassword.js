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
import { config } from "../config/config_env"

var emailToSend

const Alert = forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
})

const ForgotPassword = () => {
    const history = useHistory()
    const location = useLocation()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [msg, setMsg] = useState("")
    const [open, setOpen] = useState(false)
    const [openSentSnackbar, setopenSentSnackbar] = useState(
        location.openSnackbar
    )

    const ForgotPasswordRequest = async (e) => {
        e.preventDefault()
        emailToSend = email
        const xmail = email
        try {
            await axios.post(`${config.backend}/api/resetpassword`, {
                email: xmail,
            })
            history.push({
                pathname: "/",
                openSnackbar: true,
            })
        } catch (error) {
            setOpen(true)
            console.error(error.response)
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

        setopenSentSnackbar(false)
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
                open={openSentSnackbar}
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
                    Password Reset E-mail Sent
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
                    Reset Password
                </Typography>
                <Box
                    component="form"
                    onSubmit={ForgotPasswordRequest}
                    noValidate
                    sx={{ mt: 1 }}
                >
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
                        Send Password Reset Email
                    </Button>
                </Box>
            </Box>
        </Container>
    )
}

export default ForgotPassword
