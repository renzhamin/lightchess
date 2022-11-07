import Users from "../models/UserModel"
import Games from "../models/GamesModel"
import { Op } from "sequelize"

const getPublicInfo = async (username) => {
    const user = await Users.findOne({
        where: { username: username },
        attributes: {
            exclude: [
                "password",
                "refresh_token",
                "role",
                "createdAt",
                "updatedAt",
            ],
        },
    })

    return user
}

export const getPublicUserInfo = async (req, res) => {
    const { username } = req.params

    const user = await getPublicInfo(username)

    res.json(user)
}

export const getLastNMatchResults = async (req, res) => {
    const { username } = req.params

    let n = parseInt(req.params.n)

    if (isNaN(n)) n = 5

    const games = await Games.findAll({
        limit: n,
        attributes: ["winnerUserName", "loserUserName"],
        order: [["createdAt", "DESC"]],
        where: {
            [Op.or]: [
                { winnerUserName: username },
                { loserUserName: username },
            ],
        },
    })

    let str = ""

    games.forEach((game) => {
        if (game.winnerUserName == username) str = str + "W"
        if (game.loserUserName == username) str = str + "L"
    })

    res.json({ str: str })
}
