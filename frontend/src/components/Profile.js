import { useLocation } from "react-router-dom"
import axios from "axios"
import { config } from "../config/config_env"
import { Button, Container, Grid } from "@mui/material"
import { useEffect, useState } from "react"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import { Pie } from "react-chartjs-2"

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
        }

        getUserInfo()
    }, [])

    return (
        <Container component="main" alignItems="center">
            <Grid>
                <Grid item>
                    <Pie
                        data={pieChartData}
                        width={500}
                        height={500}
                        options={{ maintainAspectRatio: false }}
                    />
                </Grid>
            </Grid>
        </Container>
    )
}

export default Profile
