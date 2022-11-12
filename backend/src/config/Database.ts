import { Sequelize } from "sequelize"
import dotenv from "dotenv"

dotenv.config()

const DB_URL = process.env.DB_URL

if (!DB_URL) {
    throw Error("database env vars are not set")
}

const db = new Sequelize(DB_URL)

export default db
