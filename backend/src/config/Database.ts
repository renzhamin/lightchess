import { Sequelize } from "sequelize"
import dotenv from "dotenv"

dotenv.config()

const DB_NAME = process.env.DB_NAME
const DB_USER = process.env.DB_USER
const DB_PASSWORD = process.env.DB_PASSWORD

if (!DB_NAME || !DB_USER || !DB_PASSWORD) {
    throw Error("database env vars are not set")
}

const db = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: "localhost",
    dialect: "mariadb",
})

export default db
