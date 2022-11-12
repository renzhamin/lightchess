import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import cors from "cors"
import db from "./config/Database"
import router from "./routes/index"
import path from "path"

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
        // TODO: db.sync() does not sync everything on ./models
        // db are only being synced when they are imported
        // in other files
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

app.use(express.static(path.join(__dirname, "build")))

interface UserData {
    username: string
    userId: string
}

const userMap: Map<string, UserData> = new Map()

function serialiseMap<K, V>(x: Map<K, V>) {
    const dMap = Object.fromEntries(x.entries())
    return dMap
}

io.on("connection", (socket) => {
    socket.on("disconnect", () => {
        userMap.delete(socket.id)
    })

    socket.onAny((eventName, ...args: any) => {
        if (eventName === "message") {
            const { to, msg } = args[0]
            socket.to(to).emit("message", { from: socket.id, msg })
        } else if (eventName === "getusers") {
            const callback = args[args.length - 1]
            const dMap = serialiseMap(userMap)
            callback(dMap)
        } else if (eventName == "initSocket") {
            const fn = args[args.length - 1]
            const { username, userId } = args[0]
            /* console.log("args", username, userId) */
            userMap.set(String(socket.id), { username, userId })
            fn(`welcome ${username} with ${userId}`)
        } else {
            if (!args || !args.length) return
            const { to } = args[0]
            if (to) {
                socket.to(to).emit(eventName, { from: socket.id, ...args[0] })
            }
        }
    })
})

let PORT = process.env.PORT || "5000"
const HOST = "0.0.0.0"

server.listen(parseInt(PORT), HOST, () =>
    console.log("Server running at port", PORT)
)
