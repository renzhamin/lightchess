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
} from "@mui/material"
import { blue, yellow, red } from "@mui/material/colors"

const GameInfo = (props) => {
    console.log(props.pgnMoves, "PGN here")
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
                                    disabled={props.mySide === props.turn}
                                    color={
                                        props.mySide === props.turn
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
                                    {props.opponentUsername}
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
                                    disabled={props.mySide !== props.turn}
                                    color={
                                        props.mySide === props.turn
                                            ? "success"
                                            : "primary"
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
