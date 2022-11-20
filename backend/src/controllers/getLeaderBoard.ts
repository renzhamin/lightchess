import Users from "../models/UserModel"

export const getLeaderBoard = async (req, res) => {
    const users = await Users.findAll({
        order: [["elo", "desc"]],
        attributes: ["username", "elo", "wins", "losses", "draws"],
    })
    res.json(users)
}
