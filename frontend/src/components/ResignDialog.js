import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogTitle from "@mui/material/DialogTitle"

export default function ResignDialog(props) {
    const { onCancel, onOk, open } = props

    return (
        <Dialog
            open={open}
            onClose={onCancel}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                {"Are you sure you want to resign ?"}
            </DialogTitle>
            <DialogActions>
                <Button onClick={onOk} autoFocus>
                    Resign
                </Button>
                <Button onClick={onCancel}>Cancel</Button>
            </DialogActions>
        </Dialog>
    )
}
