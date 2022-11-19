import { updateElo } from "../controllers/updateUserInfo"
import Games from "../models/GamesModel"
import { Op } from "sequelize"

export const getGames = async (req, res) => {
    const { username } = req.params
    const games = await Games.findAll({
        where: {
            [Op.or]: [{ blackUserName: username }, { whiteUserName: username }],
        },
    })

    if (!games) return res.status(400).json({ msg: "No games found" })

    res.json(games)
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
