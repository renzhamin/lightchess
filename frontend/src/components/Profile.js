import { CardActionArea, Container, Grid } from "@mui/material"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Link from "@mui/material/Link"
import Paper from "@mui/material/Paper"
import { default as Table, default as TableHead } from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableRow from "@mui/material/TableRow"
import Typography from "@mui/material/Typography"
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js"
import { useContext, useEffect, useState } from "react"
import Chart from "react-apexcharts"
import { Pie } from "react-chartjs-2"
import { useHistory, useLocation } from "react-router-dom"
import { AppContext } from "../App"
import { config } from "../config/config_env"

ChartJS.register(ArcElement, Tooltip, Legend)

function Profile() {
    const location = useLocation()
    const history = useHistory()
    const username = location.pathname.split("/").at(-1)
    const [currentElo, setCurrentElo] = useState()
    const { axiosJWT } = useContext(AppContext)

    // Needed for date calculation
    let DateDiff = {
        inMinutes: function (d1, d2) {
            let t2 = d2.getTime()
            let t1 = d1.getTime()

            return Math.floor((t2 - t1) / (60 * 1000))
        },

        inHours: function (d1, d2) {
            let t2 = d2.getTime()
            let t1 = d1.getTime()

            return Math.floor((t2 - t1) / (60 * 60 * 1000))
        },

        inDays: function (d1, d2) {
            let t2 = d2.getTime()
            let t1 = d1.getTime()

            return Math.floor((t2 - t1) / (24 * 3600 * 1000))
        },

        inWeeks: function (d1, d2) {
            let t2 = d2.getTime()
            let t1 = d1.getTime()

            return parseInt((t2 - t1) / (24 * 3600 * 1000 * 7))
        },

        inMonths: function (d1, d2) {
            let d1Y = d1.getFullYear()
            let d2Y = d2.getFullYear()
            let d1M = d1.getMonth()
            let d2M = d2.getMonth()

            return d2M + 12 * d2Y - (d1M + 12 * d1Y)
        },

        inYears: function (d1, d2) {
            return d2.getFullYear() - d1.getFullYear()
        },
    }

    const [pieChartData, setPieChartData] = useState({
        labels: ["Wins", "Losses", "Draws"],
        datasets: [
            {
                label: "Game History",
                data: [0, 0, 0],
                backgroundColor: [
                    "rgba(255, 99, 132, 0.2)",
                    "rgba(54, 162, 235, 0.2)",
                    "rgba(255, 206, 86, 0.2)",
                ],
                borderWidth: 1,
            },
        ],
    })

    const [lineChartOptions, setLineChartOptions] = useState({
        chart: {
            id: "elo",
        },
        xaxis: {
            categories: [],
        },
        stroke: {
            curve: "smooth",
        },
    })

    const [lineChartSeries, setLineChartSeries] = useState([
        {
            name: "elo",
            data: [],
        },
    ])

    const [leftTableData, setLeftTableData] = useState([])
    const [rightTableData, setRightTableData] = useState([])

    useEffect(() => {
        async function getUserInfo() {
            if (!username) {
                await axiosJWT.get(`${config.backend}/api/health`)
                return
            }

            const response = await axiosJWT.get(
                `${config.backend}/api/user/${username}`
            )

            if (response.data === null) {
                history.push("/notfound")
            }

            const gameHistory = [
                response.data.wins,
                response.data.losses,
                response.data.draws,
            ]

            setPieChartData({
                labels: ["Wins", "Losses", "Draws"],
                datasets: [
                    {
                        label: "Game History",
                        data: gameHistory,
                        backgroundColor: [
                            "rgb(145, 184, 102)",
                            "rgb(219, 113, 113)",
                            "rgb(211, 227, 246)",
                        ],
                        borderWidth: 2,
                    },
                ],
            })

            let eloHistory = response.data.elo_history.split(",")
            for (let i = 0; i < eloHistory.length; i++) {
                eloHistory[i] = parseInt(eloHistory[i])
            }
            const minELO = Math.min(...eloHistory)
            const maxELO = Math.max(...eloHistory)

            setLineChartSeries([
                {
                    name: "elo",
                    data: eloHistory,
                },
            ])

            // set left table data

            function createData(title, num) {
                return { title, num }
            }
            const ltData = []
            ltData.push(
                createData(
                    "Total games played",
                    parseInt(response.data.wins) +
                        parseInt(response.data.losses) +
                        parseInt(response.data.draws)
                )
            )
            ltData.push(createData("Won", response.data.wins))
            ltData.push(createData("Lost", response.data.losses))
            ltData.push(createData("Drawn", response.data.draws))
            ltData.push(createData("Won as White", response.data.winAsWhite))
            ltData.push(createData("Won as Black", response.data.winAsBlack))
            ltData.push(createData("Highest Rating", maxELO))
            ltData.push(createData("Lowest Rating", minELO))

            setLeftTableData(ltData)

            // set right table data

            const games = await axiosJWT.get(
                `${config.backend}/api/user/${username}/games`
            )

            let gameInfo = games.data
            gameInfo = gameInfo.reverse()

            function genData(
                id,
                whiteUserName,
                blackUserName,
                winnerUserName,
                loserUserName,
                pgn
            ) {
                return {
                    id,
                    whiteUserName,
                    blackUserName,
                    winnerUserName,
                    loserUserName,
                    pgn,
                }
            }
            while (gameInfo.length < 5) {
                gameInfo.push(genData("--", "--", "--", "--", "--", "--"))
            }

            function createRtData(result, opponent, ratingChange, PGN, date) {
                return { result, opponent, ratingChange, PGN, date }
            }

            const rtData = []

            for (let i = 0; i < gameInfo.length; i++) {
                let result = ""
                if (gameInfo[i].winnerUserName === "--") result = "--"
                else if (gameInfo[i].winnerUserName === username) result = "1-0"
                else if (gameInfo[i].winnerUserName !== username) result = "0-1"

                let opponent =
                    gameInfo[i].whiteUserName === username
                        ? gameInfo[i].blackUserName
                        : gameInfo[i].whiteUserName

                // process date
                let date = gameInfo[i].createdAt
                let dateString = "--"
                if (date !== undefined) {
                    const now = new Date()
                    const gameDate = new Date(date)

                    const daysPassed = DateDiff.inDays(gameDate, now)
                    const weeksPassed = DateDiff.inWeeks(gameDate, now)
                    const yearsPassed = DateDiff.inYears(gameDate, now)
                    const minutesPassed = DateDiff.inMinutes(gameDate, now)
                    const hoursPassed = DateDiff.inHours(gameDate, now)

                    if (yearsPassed > 0) {
                        dateString =
                            yearsPassed +
                            " year" +
                            (yearsPassed === 1 ? "" : "s") +
                            " ago"
                    } else if (weeksPassed > 0) {
                        dateString =
                            weeksPassed +
                            " week" +
                            (weeksPassed === 1 ? "" : "s") +
                            " ago"
                    } else if (daysPassed > 0) {
                        dateString =
                            daysPassed +
                            " day" +
                            (daysPassed === 1 ? "" : "s") +
                            " ago"
                    } else if (hoursPassed > 0) {
                        dateString =
                            hoursPassed +
                            " hour" +
                            (hoursPassed === 1 ? "" : "s") +
                            " ago"
                    } else {
                        dateString =
                            minutesPassed +
                            " minute" +
                            (minutesPassed === 1 ? "" : "s") +
                            " ago"
                    }
                }

                setCurrentElo(eloHistory.at(-1))

                // process rating change
                let ratingChange =
                    eloHistory[eloHistory.length - 1 - i] -
                    eloHistory[eloHistory.length - 1 - i - 1]
                if (ratingChange > 0) {
                    ratingChange = "+" + ratingChange.toString()
                } else {
                    ratingChange = ratingChange.toString()
                }

                if (isNaN(ratingChange)) ratingChange = "--"

                rtData.push(
                    createRtData(
                        result,
                        opponent,
                        ratingChange,
                        gameInfo[i].pgn,
                        dateString
                    )
                )
            }

            setRightTableData(rtData)
        }

        getUserInfo()
    }, [username])

    return (
        <Container component="main" alignItems="center">
            <Typography align="center" variant="h3" gutterBottom mt={5}>
                User Statistics <br></br>
            </Typography>
            <Grid
                xs={12}
                // mt={5}
                container
                spacing={0}
                direction="row"
                alignItems="center"
                justifyContent="center"
            >
                <Grid
                    item
                    sx={6}
                    alignItems="center"
                    justifyContent="center"
                    direction="column"
                >
                    <Typography
                        align="center"
                        variant="h4"
                        gutterBottom
                        mt={5}
                        mx={2}
                    >
                        {username}
                    </Typography>
                </Grid>
                <Grid item sx={6}>
                    <Typography
                        align="center"
                        variant="h5"
                        gutterBottom
                        mt={5}
                        sx={{ fontStyle: "italic" }}
                    >
                        ({currentElo})
                    </Typography>
                </Grid>
            </Grid>

            <TableContainer>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableBody>
                        <TableRow>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>

            <TableContainer>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableBody>
                        <TableRow>
                            <TableCell>
                                <Paper
                                    container
                                    spacing={0}
                                    direction="column"
                                    alignItems="center"
                                    justifyContent="center"
                                    elevation={3}
                                    align="center"
                                    sx={{ width: 300 }}
                                >
                                    <TableContainer>
                                        <Table
                                            sx={{ width: 300 }}
                                            size="small"
                                            aria-label="a dense table"
                                            align="center"
                                        >
                                            <TableBody>
                                                {leftTableData.map((row) => (
                                                    <TableRow
                                                        key={row.name}
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
                                                        >
                                                            {row.title}
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            {row.num}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Paper>
                            </TableCell>
                            <TableCell>
                                <Pie
                                    data={pieChartData}
                                    width={350}
                                    height={350}
                                    options={{ maintainAspectRatio: false }}
                                />
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
            <Typography
                variant="h5"
                gutterBottom
                mt={5}
                mb={1}
                alignContent="center"
                align="center"
            >
                Recent Game History
            </Typography>

            <Grid
                container
                spacing={0}
                mt={5}
                direction="column"
                alignItems="center"
                justifyContent="center"
            >
                <Grid item>
                    <Paper
                        container
                        spacing={0}
                        direction="column"
                        alignItems="center"
                        justifyContent="center"
                        elevation={3}
                        align="center"
                        sx={{ width: 1200, maxHeight: 600, overflow: "auto" }}
                    >
                        <TableContainer>
                            <Table
                                sx={{
                                    width: 1200,
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
                                        <TableCell align="left">
                                            Result
                                        </TableCell>
                                        <TableCell align="left">
                                            Opponent
                                        </TableCell>
                                        <TableCell align="left">
                                            Rating Change
                                        </TableCell>
                                        <TableCell align="left">PGN</TableCell>
                                        <TableCell align="left">
                                            Time Played
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {rightTableData.map((row) => (
                                        <TableRow
                                            // key={row.name}
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
                                                {row.result}
                                            </TableCell>
                                            <TableCell align="left">
                                                <Link
                                                    underline="hover"
                                                    onClick={() => {
                                                        history.push(
                                                            "/user/" +
                                                                row.opponent
                                                        )
                                                        history.go(0)
                                                    }}
                                                >
                                                    {row.opponent}
                                                </Link>
                                            </TableCell>
                                            <TableCell align="left">
                                                {row.ratingChange}
                                            </TableCell>
                                            <TableCell align="left">
                                                {row.PGN !== "--" ? (
                                                    <Link
                                                        underline="hover"
                                                        onClick={() => {
                                                            history.push({
                                                                pathname:
                                                                    "/pgnviewer",
                                                                pgn: row.PGN,
                                                            })
                                                        }}
                                                    >
                                                        {"View"}
                                                    </Link>
                                                ) : (
                                                    "--"
                                                )}
                                            </TableCell>
                                            <TableCell align="left">
                                                {row.date}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>

                <Grid item mt={10}>
                    <Card sx={{ maxWidth: 720 }}>
                        <Chart
                            options={lineChartOptions}
                            series={lineChartSeries}
                            type="area"
                            width="720"
                        />
                        <CardActionArea>
                            <CardContent>
                                <Typography
                                    gutterBottom
                                    variant="h5"
                                    component="div"
                                    align="center"
                                >
                                    Rating Graph
                                </Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    )
}

export default Profile
