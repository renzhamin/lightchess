import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import cors from "cors"
import db from "./config/Database"
import router from "./routes/index"
import passport from "passport"

import { createServer } from "http"
import { Server } from "socket.io"

dotenv.config()
const app = express()
const server = createServer(app)

export const io = new Server(server, {
    cors: {
        origin: true,
    },
})
;(async () => {
    try {
        await db.sync()
        await db.authenticate()
        console.log("Database Connected...")
    } catch (error) {
        console.error(error)
    }
})()

app.use(
    cors({
        origin: true,
        credentials: true,
    })
)
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use(router)

interface UserData {
    name: string
}

let userMap: Map<string, UserData> = new Map()

function serialiseMap<K, V>(x: Map<K, V>) {
    const dMap = Object.fromEntries(x.entries())
    return dMap
}

io.on("connection", (socket) => {
    socket.on("disconnect", () => {
        userMap.delete(socket.id)
    })

    socket.on("message", ({ to, msg }) => {
        socket.to(to).emit("message", { from: socket.id, msg })
    })

    socket.on("getusers", (arg, callback) => {
        console.log("getusers called")
        const dMap = serialiseMap(userMap)
        callback(dMap)
    })

    socket.on("name", (name, fn) => {
        userMap.set(socket.id, { name })
        fn(`welcome ${name}`)
        console.log(userMap)
    })
})

server.listen(5000, () => console.log("Server running at port 5000"))
