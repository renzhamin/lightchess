import { InferAttributes } from "sequelize"
import Users from "../models/UserModel"

export const updateStatsAfterMatchEnd = async (
    username: string,
    win: boolean,
    draw: boolean,
    black: boolean
) => {
    let col1, col2

    if (draw) {
        col1 = "draws"
        col2 = black ? "drawAsBlack" : "drawAsWhite"
    } else if (win) {
        col1 = "wins"
        col2 = black ? "winAsBlack" : "winAsWhite"
    } else {
        col1 = "losses"
        col2 = black ? "loseAsBlack" : "loseAsWhite"
    }

    const user = await Users.findOne({
        where: { username: username },
    })

    await user?.increment([col1, col2], { by: 1 })

    await user?.save()
}
