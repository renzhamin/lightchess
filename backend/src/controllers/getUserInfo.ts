import Users from "../models/UserModel"

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
