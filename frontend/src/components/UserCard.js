import { Card, Link, Paper } from "@mui/material"
import axios from "axios"
import { useHistory } from "react-router-dom"
import { useContext, useEffect, useState } from "react"
import { AppContext } from "../App"
import { config } from "../config/config_env"
import * as React from "react"
import Box from "@mui/material/Box"
import CardActions from "@mui/material/CardActions"
import CardContent from "@mui/material/CardContent"
import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"
import jwt_decode from "jwt-decode"

const UserCard = () => {
    const [expire, setExpire] = useState(0)
    const { username, setUserName } = useContext(AppContext)
    const [cardInfo, setCardInfo] = useState({})
    const history = useHistory()

    const axiosJWT = axios.create()

    axiosJWT.interceptors.request.use(
        async (axiosConfig) => {
            const currentDate = new Date()
            if (expire * 1000 < currentDate.getTime()) {
                const response = await axios.get(`${config.backend}/api/token`)
                axiosConfig.headers.Authorization = `Bearer ${response.data.accessToken}`
                const decoded = jwt_decode(response.data.accessToken)
                setUserName(decoded.username)
                setExpire(Number(decoded.exp))
            }
            return axiosConfig
        },
        (error) => {
            return Promise.reject(error)
        }
    )

    async function getLeaderboard() {
        if (!username) {
            await axiosJWT.get(`${config.backend}/api/health`)
            return
        }
        const response = await axiosJWT.get(
            `${config.backend}/api/user/${username}`
        )

        const elo = response.data.elo ?? 1200
        const gamesWon = response.data.wins ?? 0
        const gamesLost = response.data.losses ?? 0
        const gamesDrawn = response.data.draws ?? 0
        const totalGames =
            Number(gamesWon) + Number(gamesLost) + Number(gamesDrawn)

        setCardInfo({
            elo: elo,
            gamesWon: gamesWon,
            gamesLost: gamesLost,
            gamesDrawn: gamesDrawn,
            totalGames: totalGames,
        })
    }

    const card = (
        <React.Fragment>
            <CardContent>
                <Typography
                    sx={{ fontSize: 16, fontFamily: "monospace" }}
                    color="text.secondary"
                    gutterBottom
                >
                    USER CARD
                </Typography>
                <Typography variant="h5" component="div">
                    {username}
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    {cardInfo.elo}
                </Typography>
                <Typography variant="body2">
                    Won: {cardInfo.gamesWon} <br />
                    Played: {cardInfo.totalGames} <br />
                    Lost: {cardInfo.gamesLost} <br />
                    Drawn: {cardInfo.gamesDrawn} <br />
                </Typography>
            </CardContent>
            <CardActions>
                <Button size="small">
                    <Link
                        underline="hover"
                        onClick={() => {
                            history.push("/user/" + username)
                        }}
                    >
                        PROFILE
                    </Link>
                </Button>
            </CardActions>
        </React.Fragment>
    )

    useEffect(() => {
        getLeaderboard()
    }, [username])

    return (
        <Box sx={{ width: 270 }}>
            <Paper elevation={3}>{card}</Paper>
        </Box>
    )
}

export default UserCard
