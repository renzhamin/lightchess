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

    if (!games) return res.status(404).json({ msg: "No games found" })

    res.json(games)
}

export const addGames = async (req, res) => {
    const addedGame = await Games.create({
        whiteUserName: req.body.whiteUserName,
        blackUserName: req.body.blackUserName,
        winnerUserName: req.body.winnerUserName,
        loserUserName: req.body.loserUserName,
        pgn: req.body.pgn,
    }).catch(() => {
        return res
            .status(500)
            .json({ msg: "Database Error: Could not create game" })
    })

    const { whiteUserElo, blackUserElo } = req.body

    if (isNaN(parseInt(whiteUserElo))) {
        return res
            .status(400)
            .json({ msg: "Non-Integer Elo provided for white" })
    }
    if (isNaN(parseInt(blackUserElo))) {
        return res
            .status(400)
            .json({ msg: "Non-Integer Elo provided for black" })
    }

    updateElo(req.body.blackUserName, parseInt(req.body.blackUserElo))
    updateElo(req.body.whiteUserName, parseInt(req.body.whiteUserElo))

    res.json({ game: addedGame })
}
