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
                <Table align="center" sx={{ width: 350 }}>
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
                                    {props.myTimeInfo}
                                </Button>
                            </TableCell>
                        </TableRow>
                        <TableRow sx={{ "& td": { border: 0 } }}>
                            <TableCell style={{ width: 100 }} align="left">
                                <Typography variant="h5">
                                    {props.opponentUserName}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography
                                    variant="subtitle2"
                                    sx={{ fontStyle: "italic" }}
                                    align="left"
                                >
                                    {props.opponentELO}
                                </Typography>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                <Typography
                                    variant="subtitle"
                                    style={{ width: 10 }}
                                    align="left"
                                >
                                    Past Games:
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="h6">
                                    {props.opponentHistory}
                                </Typography>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell align="center" width={300}>
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
                                                width: 300,
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
                                                                height: 100,
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
                            <TableCell align="center" width={350}>
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
                        <TableRow>
                            <TableCell>
                                <Typography
                                    variant="h5"
                                    style={{ width: 100 }}
                                    align="left"
                                >
                                    {props.myUsername}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography
                                    variant="subtitle2"
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
