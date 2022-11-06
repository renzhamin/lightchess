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

function GameEndDialog(props) {
    const { onClose, open } = props
    var message = ""

    const handleClose = () => {
        onClose()
    }

    return (
        <Dialog onClose={handleClose} open={open}>
            <DialogTitle align="center">Game Over!</DialogTitle>
            <DialogContent>
                <DialogContentText id="game-description" align="center">
                    {props.gameEndMessage}
                </DialogContentText>
            </DialogContent>
        </Dialog>
    )
}

export default GameEndDialog
