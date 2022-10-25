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
                            <TableCell>{props.pgn}</TableCell>
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
