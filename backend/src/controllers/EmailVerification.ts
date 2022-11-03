import jwt from "jsonwebtoken"
import sendMail from "../modules/SendEmail"

export const sendEmailVerificationLink = async (req, res) => {
    const userID = req.user.id
    const username = req.user.username
    const email = req.user.email
    const password = req.user.password
    const secret = password

    console.log(username, email, password)

    const accessToken = jwt.sign({ userID, username, email }, secret, {
        expiresIn: "30d",
    })

    const url = req.protocol + "://" + req.get("host") + req.originalUrl

    const verificationLink = `<a target='_blank' href='${url}/${userID}/${accessToken}'>Verify your email</a>`
    await sendMail(email, "Lightchess account verification", verificationLink)
    return res.json({
        msg: "Register successful, please verify your email before login",
    })
}
