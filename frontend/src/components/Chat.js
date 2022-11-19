import { Box, Button, NativeSelect, Snackbar, Alert, Grid } from "@mui/material"
import { useContext, useEffect, useState } from "react"
import { useHistory } from "react-router-dom"
import { AppContext } from "../App.js"

var playingAgainst

export const Chat = (props) => {
    const { initSocket, socket, updateUserList, userList, username } =
        useContext(AppContext)
    const history = useHistory()
    const [open, setOpen] = useState(false)

    const [receiver, setReceiver] = useState({})
    const [myColor, setMyColor] = useState(0)
    // 1 is black

    const handleClick = () => {
        setOpen(true)
    }

    const handleClose = (event, reason) => {
        if (reason === "clickaway") {
            return
        }

        setOpen(false)
    }

    useEffect(() => {
        initSocket({ username })
        updateUserList()

        console.log(username)

        socket.on("Challenge_accepted", (data) => {
            console.log(data)
            history.push("/play/" + data.from + "/" + data.yourcolor)
            console.log("Challenge accepted")
        })

        socket.on("Challenge", (data) => {
            console.log("I WAS CHALLENGED")
            playingAgainst = data.from
            console.log(playingAgainst)
            handleClick()
        })

        return () => {
            socket.off("Challenge")
            socket.off("Challenge_accepted")
        }
    }, [])

    const handleReceiverChange = (e) => {
        e.preventDefault()
        const selectedIndex = e.target.options.selectedIndex
        const id = e.target.options[selectedIndex].getAttribute("id")
        setReceiver({ id, username: e.target.value })
    }

    const AcceptChallenge = (e) => {
        console.log("Challenge Accepted")
        e.preventDefault()
        console.log("At accept challenge ", playingAgainst)
        socket.emit("Challenge_accepted", {
            to: playingAgainst,
            msg: "challenge_accepted",
            yourcolor: myColor == 1 ? 0 : 1,
        })
        history.push("/play/" + playingAgainst + "/" + myColor)
    }

    const Challenge = (e) => {
        console.log("Sending challenge")
        e.preventDefault()
        socket.emit("Challenge", {
            to: receiver.id,
            msg: "challenge",
            // yourcolor: myColor == 1 ? 0 : 1,
        })
        /* history.push("/play/" + receiver.id + "/" + myColor) */
    }

    return (
        <Box component="form" noValidate onSubmit={Challenge} sx={{ mt: 3 }}>
            <NativeSelect
                name="Receiver"
                onChange={handleReceiverChange}
                onMouseOver={() => {
                    initSocket({ username })
                    updateUserList()
                }}
            >
                <option value="Select Receiver">Select Receiver</option>
                {userList &&
                    userList.map((user) => {
                        if (user.username == username) {
                            return ""
                        }
                        return (
                            <option
                                key={user.id}
                                id={user.id}
                                value={user.username}
                            >
                                {user.username + "--" + user.userId}
                            </option>
                        )
                    })}
            </NativeSelect>
            <Snackbar
                open={open}
                autoHideDuration={15000}
                onClose={handleClose}
            >
                <Alert
                    onClose={handleClose}
                    severity="info"
                    sx={{ width: "250%", height: "250%" }}
                >
                    Challenge Received!
                    <Grid>
                        <Button
                            color="success"
                            variant="contained"
                            onClick={AcceptChallenge}
                        >
                            Accept
                        </Button>
                        <Button
                            color="error"
                            variant="outlined"
                            onClick={handleClose}
                        >
                            Reject
                        </Button>
                    </Grid>
                </Alert>
            </Snackbar>
            <Button type="submit">Challenge</Button>
        </Box>
    )
}
