import { Sequelize } from "sequelize"
import dotenv from "dotenv"

dotenv.config()

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
    throw Error("database env vars are not set")
}

const db = new Sequelize(DATABASE_URL, {
    logging: false,
})

export default db
