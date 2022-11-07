import db from "./config/Database"
import Sequelize from "sequelize"
import { InferAttributes } from "sequelize"
import Users from "./models/UserModel"
import Games from "./models/GamesModel"
import { Op } from "sequelize"

const main = async () => {
    await db.sync()
    await db.authenticate()
    console.log("Connected")

    const username = "fahim"

    const games = await Games.findAll({
        limit: 5,
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

    console.log("Last streak for", username, str)
}

main()
