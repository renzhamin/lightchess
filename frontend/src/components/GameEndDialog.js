import { DialogContent, DialogContentText } from "@mui/material"
import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import { useHistory } from "react-router-dom"

function GameEndDialog(props) {
    const { onClose, open } = props
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
