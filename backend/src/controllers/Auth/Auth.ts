import Users from "../../models/UserModel"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import sendMail from "../../modules/SendEmail"
import dotenv from "dotenv"
import Sequelize from "sequelize"
import {
    getAccessTokenFromUserDetails,
    getRefreshToken,
} from "../../modules/Tokens"
import { get_url_from_req } from "../../modules/Utils"
dotenv.config()

const { Op } = Sequelize

export const getUsers = async (req, res) => {
    try {
        const users = await Users.findAll({
            attributes: ["id", "username", "email"],
        })
        return res.json(users)
    } catch (error) {
        return res.json({ msg: "Database Error : in getUsers()" })
    }
}

export const getPasswordResetLink = async (req, res) => {
    try {
        if (!req.body.email) {
            return res.status(400).json({ msg: "No email provided" })
        }

        const user: Users | null = await Users.findOne({
            where: {
                email: req.body.email,
            },
        }).catch(() => {
            return res
                .status(500)
                .json({ msg: "Database Error : Can't query user" })
        })

        if (!user || !user.email) return res.json({ msg: "Email not found" })
        const { id, username, email } = user

        const secret = user.password

        const accessToken = jwt.sign({ id, username, email }, secret, {
            expiresIn: "5m",
        })

        const url = get_url_from_req(req)

        const resetLink = `<a target='_blank' href='${url}/${id}/${accessToken}'>Password Reset Link</a>`
        sendMail(email, "Reset Password for Lightchess", resetLink)
        res.json({ msg: "Email sent" })
    } catch (error) {
        res.status(500).json({ msg: "Failed to send email" })
    }
}

export const getPasswordResetPage = (req, res) => {
    const { userID, token } = req.params

    res.send(`<form action="/api/resetpassword/${userID}/${token}" method="POST">
             <input type="password" name="password" value="" placeholder="Enter your new password..." /> 
             <input type="submit" value="Reset Password" />
             </form>`)
}

export const Login = async (req, res) => {
    try {
        const email = req.body.email

        if (!email) res.status(400).json({ msg: "Provide Email" })

        const user = await Users.findOne({
            where: {
                [Op.or]: [{ email: email }, { username: email }],
            },
        }).catch(() => {
            return res
                .status(500)
                .json({ msg: "Database Error : Can't query user" })
        })

        if (!user) {
            return res.status(400).json({ msg: "User doesn't exist" })
        }
        if (!req.body.password) {
            return res.status(400).json({ msg: "Password field empty" })
        }

        const match = await bcrypt.compare(req.body.password, user.password)
        if (!match) return res.status(400).json({ msg: "Wrong Password" })

        if (process.env.DEBUG_MODE != "1") {
            if (parseInt(user.role) < 1)
                return res.status(400).json({ msg: "Email not verified" })
        }

        const { id, username } = user

        const accessToken = getAccessTokenFromUserDetails({
            id,
            username,
            email,
        })
        const refreshToken = getRefreshToken({ id, username, email })

        res.cookie("refreshToken", refreshToken, {
            maxAge: 24 * 60 * 60 * 30 * 1000,
        })

        return res.json({ msg: "Successfull Login" })
    } catch (error) {
        return res.status(500).json({ msg: "Internal Error" })
    }
}

export const Logout = async (req, res) => {
    const refreshToken = req.cookies.refreshToken
    if (!refreshToken) return res.sendStatus(204)
    res.clearCookie("refreshToken")

    return res.sendStatus(200)
}
