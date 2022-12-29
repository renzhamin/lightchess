import * as React from "react"
import PropTypes from "prop-types"
import Button from "@mui/material/Button"
import Avatar from "@mui/material/Avatar"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemAvatar from "@mui/material/ListItemAvatar"
import ListItemText from "@mui/material/ListItemText"
import DialogTitle from "@mui/material/DialogTitle"
import Dialog from "@mui/material/Dialog"
import { DialogContent, DialogContentText } from "@mui/material"
import { useHistory } from "react-router-dom"

function GameEndDialog(props) {
    const { onClose, open } = props
    var message = ""
    const history = useHistory()

    const handleClose = () => {
        onClose()
    }

    const Home = () => {
        history.push({ pathname: "/", refresh: true })
    }

    return (
        <Dialog onClose={handleClose} open={open}>
            <DialogTitle align="center">{props.gameEndTitle}</DialogTitle>
            <DialogContent>
                <DialogContentText id="game-description" align="center">
                    {props.gameEndMessage}
                </DialogContentText>
            </DialogContent>
            <Button variant="contained" onClick={Home}>
                HOME
            </Button>
        </Dialog>
    )
}

export default GameEndDialog
