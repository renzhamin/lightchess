import db from "./config/Database"
import Users from "./models/UserModel"
import { Op } from "sequelize"

const get_available_username = async (username: string) => {
    const users = await Users.findAll({
        attributes: ["username"],
        where: {
            username: {
                [Op.like]: username + "%",
            },
        },
    })
    const userSet: Set<string> = new Set()
    users.forEach((user) => userSet.add(user.username))

    for (let i = 1; ; i++) {
        if (!userSet.has(username + i)) {
            return username + i
        }
    }
}

const get_username_from_email = (email: string) => {
    return email.substr(0, email.indexOf("@"))
}

const main = async () => {
    await db.sync()
    await db.authenticate()
    console.log("Connected")
    const email = "tasnim1@gmail.com"
    const username = await get_available_username(
        get_username_from_email(email)
    )
    console.log("username will be", username)
}

main()
