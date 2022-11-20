import {
    Grid,
    Link,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material"
import axios from "axios"
import { useEffect, useState } from "react"
import { config } from "../config/config_env"
import { useHistory } from "react-router-dom"

const Leaderboard = () => {
    const [leaderBoardTable, setLeaderBoardTable] = useState([])
    const history = useHistory()

    useEffect(() => {
        async function getLeaderboard() {
            const response = await axios.get(
                `${config.backend}/api/leaderboard`
            )

            const userInfo = response.data

            // rank, username, curelo, gameswon
            function createData(rank, username, curElo, gamesWon) {
                return { rank, username, curElo, gamesWon }
            }
            const table = []
            for (let i = 0; i < userInfo.length; i++) {
                table.push(
                    createData(
                        i + 1,
                        userInfo[i].username,
                        userInfo[i].elo,
                        userInfo[i].wins
                    )
                )
            }

            setLeaderBoardTable(table)
        }

        getLeaderboard()
    }, [])

    return (
        <>
            <Typography variant="h6" gutterBottom>
                Leaderboard
            </Typography>
            <Grid>
                <Grid item>
                    <Paper
                        container
                        spacing={0}
                        direction="column"
                        alignItems="center"
                        justifyContent="center"
                        elevation={3}
                        align="center"
                        sx={{ width: 400, maxHeight: 600, overflow: "auto" }}
                    >
                        <TableContainer>
                            <Table
                                sx={{
                                    width: 400,
                                    maxHeight: 600,
                                    tableLayout: "fixed",
                                }}
                                size="small"
                                aria-label="a dense table"
                                align="center"
                            >
                                <TableHead
                                    sx={{
                                        display: "table-header-group",
                                    }}
                                >
                                    <TableRow>
                                        <TableCell align="left">Rank</TableCell>
                                        <TableCell align="left">
                                            Username
                                        </TableCell>
                                        <TableCell align="left">
                                            Rating
                                        </TableCell>
                                        <TableCell align="left">
                                            Games Won
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {leaderBoardTable.map((row) => (
                                        <TableRow
                                            sx={{
                                                "&:last-child td, &:last-child th":
                                                    {
                                                        border: 0,
                                                    },
                                            }}
                                        >
                                            <TableCell
                                                component="th"
                                                scope="row"
                                                align="left"
                                            >
                                                {row.rank}
                                            </TableCell>
                                            <TableCell align="left">
                                                <Link
                                                    underline="hover"
                                                    onClick={() => {
                                                        history.push(
                                                            "/user/" +
                                                                row.username
                                                        )
                                                        // history.go(0)
                                                    }}
                                                >
                                                    {row.username}
                                                </Link>
                                            </TableCell>
                                            <TableCell align="left">
                                                {row.curElo}
                                            </TableCell>
                                            <TableCell align="left">
                                                {row.gamesWon}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>
        </>
    )
}

export default Leaderboard
