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
    Tooltip,
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
                <Table align="center" sx={{ maxWidth: "400px" }}>
                    <TableBody>
                        <TableRow>
                            <TableCell colSpan={2}>
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
                                    {props.myTimeInfo}
                                </Button>
                            </TableCell>
                        </TableRow>
                        <TableRow sx={{ "& td": { border: 0 } }}>
                            <TableCell align="left">
                                <Typography variant="h5">
                                    {props.opponentUserName}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography
                                    variant="subtitle2"
                                    sx={{ fontStyle: "italic" }}
                                    align="right"
                                >
                                    {props.opponentELO}
                                </Typography>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                <Typography variant="subtitle" align="left">
                                    Past Games:
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="h6" align="right">
                                    {props.opponentHistory}
                                </Typography>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell align="center" colSpan={2}>
                                <div style={{ overflow: "auto" }}>
                                    <div
                                        style={{
                                            height: "150px",
                                        }}
                                    >
                                        <Table
                                            sx={{
                                                tableLayout: "fixed",
                                            }}
                                            align="center"
                                            size="small"
                                        >
                                            <TableBody>
                                                {props.pgnMoves.map(
                                                    (move, index) => (
                                                        <TableRow
                                                            key={index}
                                                            sx={{
                                                                height: 80,
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
                            <TableCell align="center" colSpan={2}>
                                <Tooltip title="Resign">
                                    <IconButton
                                        onClick={() => {
                                            resign()
                                        }}
                                        color="primary"
                                        aria-label="resign-button"
                                        component="label"
                                        disabled={props.gameOver}
                                    >
                                        <Close />
                                    </IconButton>
                                </Tooltip>
                            </TableCell>
                        </TableRow>
                        <TableRow width={"100%"}>
                            <TableCell>
                                <Typography variant="h5" align="left">
                                    {props.myUsername}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography
                                    variant="subtitle2"
                                    align="right"
                                    sx={{ fontStyle: "italic" }}
                                >
                                    {props.myELO}
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
                                    {props.opponentTimeInfo}
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
