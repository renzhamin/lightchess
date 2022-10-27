import { Box, Button, NativeSelect } from "@mui/material"
import { useContext, useEffect, useState } from "react"
import { useHistory } from "react-router-dom"
import { AppContext } from "../App.js"

export const Chat = (props) => {
    const { initSocket, socket, updateUserList, userList, userId } =
        useContext(AppContext)
    const { name } = props
    const history = useHistory()

    const [receiver, setReceiver] = useState({})
    const [myColor, setMyColor] = useState(0)
    // 1 is black

    useEffect(() => {
        socket.on("Challenge", (data) => {
            history.push("/play/" + data.from + "/" + data.yourcolor)
            console.log("Got Challange")
        })

        return () => {
            socket.off("Challenge")
        }
    }, [])

    const handleReceiverChange = (e) => {
        e.preventDefault()
        const selectedIndex = e.target.options.selectedIndex
        const id = e.target.options[selectedIndex].getAttribute("id")
        setReceiver({ id, name: e.target.value })
    }

    const Challenge = (e) => {
        console.log("Sending challenge")
        e.preventDefault()
        socket.emit("Challenge", {
            to: receiver.id,
            msg: "challenge",
            yourcolor: myColor == 1 ? 0 : 1,
        })
        history.push("/play/" + receiver.id + "/" + myColor)
    }

    return (
        <Box component="form" noValidate onSubmit={Challenge} sx={{ mt: 3 }}>
            <NativeSelect
                name="Receiver"
                onChange={handleReceiverChange}
                onMouseOver={() => {
                    initSocket({ name, userId })
                    updateUserList()
                }}
            >
                <option value="Select Receiver">Select Receiver</option>
                {userList &&
                    userList.map((user) => {
                        if (user.name === name) {
                            return ""
                        }
                        return (
                            <option
                                key={user.id}
                                id={user.id}
                                value={user.name}
                            >
                                {user.name + "--" + user.userId}
                            </option>
                        )
                    })}
            </NativeSelect>
            <Button type="submit">Challenge</Button>
        </Box>
    )
}
