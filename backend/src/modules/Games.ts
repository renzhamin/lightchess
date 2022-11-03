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
        whiteUserId: req.body.whiteUserId,
        blackUserId: req.body.blackUserId,
        winnerUserId: req.body.winnerUserId,
        loserUserId: req.body.loserUserId,
        pgn: req.body.pgn,
    }).catch((err) => {
        console.log(err)
        return res.json({ msg: err })
    })
    res.json({ game: addedGame })
}
