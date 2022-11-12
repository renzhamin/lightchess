import jwt from "jsonwebtoken"
import Users from "../models/UserModel"
import { verifyAccessToken } from "../modules/Tokens"

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]
    if (token == null) return res.sendStatus(401)
    const user = verifyAccessToken(token)
    if (!user) return res.status(401).json({ msg: "Invalid token" })

    req.user = user
    return next()
}

export const verifySpecialAccessToken = async (req, res, next) => {
    try {
        const { userID, token } = req.params

        const user = await Users.findOne({
            where: {
                id: userID,
            },
        })

        const secret = user!.password

        jwt.verify(token, secret, (err, decoded) => {
            if (err) return res.status(404).json({ msg: "Invalid token found" })
            req.email = decoded.email
            req.userID = userID
            next()
        })
    } catch (error) {
        res.status(404).json({ msg: "Invalid token, no id" })
    }
}
