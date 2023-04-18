import jwt from "jsonwebtoken"
import Users from "../models/UserModel"
import sendMail from "../modules/SendEmail"

export const sendEmailVerificationLink = async (req, res) => {
    const email = req.body.email

    if (!email) {
        res.json({ msg: "Provide email mfo" })
        return
    }

    const user = await Users.findOne({
        where: { email },
    })

    if (!user) {
        res.json({ msg: "No such user" })
        return
    }

    const userID = user.id
    const username = user.username
    const password = user.password
    const secret = password

    const accessToken = jwt.sign({ userID, username, email }, secret, {
        expiresIn: "1y",
    })

    const url = req.protocol + "://" + req.get("host") + req.originalUrl

    const verificationLink = `<a target='_blank' href='${url}/${userID}/${accessToken}'>Verify your email</a>`
    await sendMail(email, "Lightchess account verification", verificationLink)
    return res.json({
        msg: "verification link has been sent successfully",
    })
}
