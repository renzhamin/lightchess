import Users from "../models/UserModel"
import bcrypt from "bcrypt"
import { Op } from "sequelize"
import verifalia = require("verifalia")

export const validateRegistrationData = async (req, res, next) => {
    const { email, username, password, confPassword } = req.body

    if (!password) return res.status(400).json({ msg: "Provide password" })

    if (!username) return res.status(400).json({ msg: "Provide username" })

    if (!email) return res.status(400).json({ msg: "Provide email" })

    const user = await Users.findOne({
        where: {
            [Op.or]: [{ email: email }, { username: username }],
        },
    })

    if (user)
        return res.status(400).json({ msg: "email or username already in use" })

    if (process.env.DEBUG_MODE == "1") {
        return next()
    }

    if (password !== confPassword)
        return res.status(400).json({ msg: "Passwords don't match" })

    const verifalia_username = process.env.verifalia_username
    const verifalia_password = process.env.verifalia_password

    if (!verifalia_username || !verifalia_password) {
        return res
            .status(503)
            .json({ msg: "Server can't verify email right now" })
    }

    const verifier = new verifalia.VerifaliaRestClient({
        username: verifalia_username,
        password: verifalia_password,
    })

    verifier.emailValidations
        .submit(email)
        .then((result) => {
            if (
                result?.entries[0].classification != "Undeliverable" &&
                result?.entries[0].isDisposableEmailAddress == false
            ) {
                next()
            } else {
                return res.status(400).json({ msg: "Invalid Email" })
            }
        })
        .catch(() => {
            return res.status(400).json({ msg: "Error verifying email" })
        })
}

export const createUser = async (req, res, next) => {
    const { username, email, password } = req.body
    try {
        const salt = await bcrypt.genSalt()
        const hashPassword = await bcrypt.hash(password, salt)
        const createdUser = await Users.create({
            username: username,
            email: email,
            password: hashPassword,
        }).catch((err) => {
            return res.json({ msg: "Error creating user" })
        })
        req.user = createdUser
        next()
    } catch (error) {
        console.log(error)
    }
}
