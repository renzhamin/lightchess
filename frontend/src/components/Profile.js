import { useLocation } from "react-router-dom"
import axios from "axios"
import { config } from "../config"
import { Button, Container } from "@mui/material"
import { useEffect, useState } from "react"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import { Pie } from "react-chartjs-2"

ChartJS.register(ArcElement, Tooltip, Legend)

function Profile(props) {
    const location = useLocation()
    const username = location.pathname.split("/").at(-1)

    let defaultData = {
        labels: ["Won", "Lost", "Drawn"],
        datasets: [
            // {
            //     label: "Game history",
            //     data: [12, 19, 3],
            //     backgroundColor: [
            //         "rgb(0, 255, 0)",
            //         "rgb(255, 0, 0)",
            //         "rgb(220, 220, 220)",
            //     ],
            //     // borderColor: [
            //     //   'rgba(255, 99, 132, 1)',
            //     //   'rgba(54, 162, 235, 1)',
            //     //   'rgba(255, 206, 86, 1)',
            //     // ],
            //     borderWidth: 1,
            // },
        ],
    }

    const [allStats, setAllStats] = useState()
    const [data, setData] = useState(defaultData)

    useEffect(() => {
        async function getUserInfo() {
            const response = await axios.get(
                `${config.backend}/api/user/${username}`
            )
            console.log("Response from backend", response.data)

            setAllStats(response.data)
        }

        getUserInfo()
    }, [])

    useEffect(() => {
        if (allStats === undefined) return
        console.log("sdh", allStats)
        const info = {
            label: "Game History",
            data: [allStats.wins, allStats.losses, allStats.draws],
            // data: [50, 50, 50],
            backgroundColor: [
                "rgb(0, 255, 0)",
                "rgb(255, 0, 0)",
                "rgb(220, 220, 220)",
            ],
        }
        defaultData.datasets.push(info)

        console.log("new def data", defaultData)
        setData(defaultData)
    }, [allStats])

    // const info = {
    //     label: "Game History",
    //     // data: [stats.wins, stats.losses, stats.draws],
    //     data: [50, 50, 50],
    //     backgroundColor: [
    //         "rgb(0, 255, 0)",
    //         "rgb(255, 0, 0)",
    //         "rgb(220, 220, 220)",
    //     ],
    // }
    // defaultData.datasets.push(info)

    // console.log("new def data", defaultData)
    // setData(defaultData)

    return (
        <Container component="main" alignItems="center">
            <div>Hello, {username}</div>
            {/* <Button
                size="large"
                sx={{ mt: 3, mb: 2 }}
                variant="contained"
                alignItems="center"
            >
                Refresh
            </Button> */}
            <Pie data={data} redraw="true" />
        </Container>
    )
}

export default Profile
