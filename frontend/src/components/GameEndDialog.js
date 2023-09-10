import { DialogContent, DialogContentText } from "@mui/material"
import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"

function GameEndDialog(props) {
    const { onClose, open } = props

    const handleClose = () => {
        onClose()
    }

    return (
        <Dialog onClose={handleClose} open={open} fullWidth="400px">
            <DialogTitle align="center">{props.gameEndTitle}</DialogTitle>
            <DialogContent>
                <DialogContentText id="game-description" align="center">
                    {props.gameEndMessage}
                </DialogContentText>
            </DialogContent>
            <Button variant="contained" href="/">
                HOME
            </Button>
        </Dialog>
    )
}

export default GameEndDialog
