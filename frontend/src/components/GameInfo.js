import {
    Table,
    Button,
    Typography,
    Container,
    CssBaseline,
    TableContainer,
    Paper,
    TableRow,
    TableCell,
    TableBody,
    IconButton,
} from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import { Close } from "@material-ui/icons"

const GameInfo = (props) => {
    function myClockTick() {
        return props.mySide === props.turn && !props.gameOver
    }

    function resign() {
        props.gameEndHandler(true)
    }

    function opponentClockTick() {
        return props.mySide !== props.turn && !props.gameOver
    }

    return (
        <Container component="main" alignItems="center">
            <CssBaseline />
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 300 }}>
                    <TableBody>
                        <TableRow>
                            <TableCell>
                                <Button
                                    variant="contained"
                                    disabled={!opponentClockTick()}
                                    color={
                                        !opponentClockTick()
                                            ? "primary"
                                            : "success"
                                    }
                                    sx={{ fontSize: 35 }}
                                >
                                    {props.opponentTimeInfo}
                                </Button>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                <Typography variant="h5">
                                    {props.opponentUserName}
                                </Typography>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                <div style={{ overflow: "auto" }}>
                                    <div
                                        style={{
                                            height: "150px",
                                            width: "300",
                                        }}
                                    >
                                        <Table
                                            sx={{
                                                tableLayout: "fixed",
                                                maxWidth: 300,
                                            }}
                                        >
                                            <TableBody>
                                                {props.pgnMoves.map(
                                                    (move, index) => (
                                                        <TableRow
                                                            sx={{
                                                                height: 5,
                                                            }}
                                                        >
                                                            <TableCell>
                                                                {index + 1}
                                                            </TableCell>
                                                            <TableCell>
                                                                {move.whiteMove}
                                                            </TableCell>
                                                            <TableCell>
                                                                {move.blackMove}
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell align="center">
                                <IconButton
                                    onClick={() => {
                                        resign()
                                    }}
                                    color="primary"
                                    aria-label="resign-button"
                                    component="label"
                                >
                                    <Close />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                <Typography variant="h5">
                                    {props.myUsername}
                                </Typography>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                <Button
                                    sx={{ fontSize: 35 }}
                                    disabled={!myClockTick()}
                                    color={
                                        !myClockTick() ? "primary" : "success"
                                    }
                                    variant="contained"
                                >
                                    {props.myTimeInfo}
                                </Button>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    )
}

export default GameInfo
