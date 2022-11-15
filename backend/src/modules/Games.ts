import { updateElo } from "../controllers/updateUserInfo"
import Games from "../models/GamesModel"

export const getGames = async (req, res) => {
    try {
        const games = await Games.findAll()
        console.log(games)
        return res.json(games)
    } catch (error) {
        return res.status(404).json({ msg: "Invalid token, no id" })
    }
}

export const addGames = async (req, res) => {
    console.log(req.body.pgn)
    const addedGame = await Games.create({
        whiteUserName: req.body.whiteUserName,
        blackUserName: req.body.blackUserName,
        winnerUserName: req.body.winnerUserName,
        loserUserName: req.body.loserUserName,
        pgn: req.body.pgn,
    }).catch((err) => {
        console.log(err)
        return res.json({ msg: err })
    })

    const { whiteUserElo, blackUserElo } = req.body

    if (isNaN(parseInt(whiteUserElo))) {
        console.log(req.body.whiteUserName, "'s elo is Nan")
        return
    }
    if (isNaN(parseInt(blackUserElo))) {
        console.log(req.body.blackUserElo, "'s elo is Nan")
        return
    }

    updateElo(req.body.blackUserName, parseInt(req.body.blackUserElo))
    updateElo(req.body.whiteUserName, parseInt(req.body.whiteUserElo))

    res.json({ game: addedGame })
}
