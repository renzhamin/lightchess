import db from "./config/Database"
import Sequelize from "sequelize"
import { InferAttributes } from "sequelize"
import Users from "./models/UserModel"

const main = async () => {
    await db.sync()
    await db.authenticate()
    console.log("Connected")

    interface IUsers extends InferAttributes<Users> = {
        str : string
    }
    let col: TUsers = "drawsdsad"
    col = "username"

    console.log(col)
    /* await updateStatsAfterMatchEnd("a", 1, 0, 1) */
}

main()
