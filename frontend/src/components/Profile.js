import { useLocation } from "react-router-dom"
import axios from "axios"
import { config } from "../config/config_env"
import { Container, Grid } from "@mui/material"
import { useEffect, useState } from "react"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import { Pie } from "react-chartjs-2"
import Chart from "react-apexcharts"

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
            console.log(gameHistory)

            setPieChartData({
                labels: ["Wins", "Losses", "Draws"],
                datasets: [
                    {
                        label: "Game History",
                        data: gameHistory,
                        backgroundColor: [
                            "rgba(255, 99, 132, 0.2)",
                            "rgba(54, 162, 235, 0.2)",
                            "rgba(255, 206, 86, 0.2)",
                        ],
                        borderWidth: 1,
                    },
                ],
            })

            var eloHistory = response.data.elo_history.split(",")
            for (let i = 0; i < eloHistory.length; i++) {
                eloHistory[i] = parseInt(eloHistory[i])
            }

            setLineChartSeries([
                {
                    name: "elo",
                    data: eloHistory,
                },
            ])

            console.log(eloHistory)
        }

        getUserInfo()
    }, [])

    return (
        <Container component="main" alignItems="center">
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
                <Grid item mt={10}>
                    <Chart
                        options={lineChartOptions}
                        series={lineChartSeries}
                        type="line"
                        width="500"
                    />
                </Grid>
            </Grid>
        </Container>
    )
}

export default Profile
