import { useLocation } from "react-router-dom"
import axios from "axios"
import { config } from "../config/config_env"
import { Container, Grid } from "@mui/material"
import { useEffect, useState } from "react"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import { Pie } from "react-chartjs-2"
import Chart from "react-apexcharts"
import Box from "@mui/material/Box"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import { CardActionArea } from "@mui/material"
import Typography from "@mui/material/Typography"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableRow from "@mui/material/TableRow"
import Paper from "@mui/material/Paper"

ChartJS.register(ArcElement, Tooltip, Legend)

function Profile(props) {
    const location = useLocation()
    const username = location.pathname.split("/").at(-1)

    const [pieChartData, setPieChartData] = useState({
        labels: [],
        datasets: [
            {
                label: "Game History",
                data: [],
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
        fill: {
            type: "solid",
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.7,
                opacityTo: 0.9,
                stops: [0, 90, 100],
            },
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
            const response = await axios.get(
                `${config.backend}/api/user/${username}`
            )
            console.log("Response from backend", response.data)

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

            var eloHistory = response.data.elo_history.split(",")
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
                createData("Total games played", response.data.totalPlayed)
            )
            ltData.push(
                createData("Games won as white", response.data.winAsWhite)
            )
            ltData.push(
                createData("Games won as black", response.data.winAsBlack)
            )
            ltData.push(createData("Highest Rating", maxELO))
            ltData.push(createData("Lowest Rating", minELO))

            setLeftTableData(ltData)

            // set right table data
        }

        getUserInfo()
    }, [])

    return (
        <Container component="main" alignItems="center">
            <Typography align="center" variant="h3" gutterBottom>
                {username}
            </Typography>

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
                            <TableCell>Another table will go here</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>

            <Grid
                container
                spacing={0}
                direction="column"
                alignItems="center"
                justifyContent="center"
            >
                <Grid item>
                    <Pie
                        data={pieChartData}
                        width={350}
                        height={350}
                        options={{ maintainAspectRatio: false }}
                    />
                </Grid>
                <Typography gutterBottom variant="h5" component="div">
                    Win/Loss stats
                </Typography>
                <Grid item mt={10}>
                    <Card sx={{ maxWidth: 720 }}>
                        <Chart
                            options={lineChartOptions}
                            series={lineChartSeries}
                            type="line"
                            width="720"
                        />
                        <CardActionArea>
                            <CardContent>
                                <Typography
                                    gutterBottom
                                    variant="h5"
                                    component="div"
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
