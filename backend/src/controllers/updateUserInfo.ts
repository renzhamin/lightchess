import Users from "../models/UserModel"

export const updateElo = async (username: string, elo: number) => {
    const user = await Users.findOne({
        where: { username: username },
    })

    if (!user) {
        console.log(username, " not found for elo update")
        return
    }

    user.elo = elo
    user.elo_history += "," + String(elo)
    await user.save()
}

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

    if (!user) {
        console.log(username, "not found for updateStatsAfterMatchEnd")
        return
    }

    await user.increment([col1, col2], { by: 1 })

    await user.save()
}
