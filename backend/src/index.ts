import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import cors from "cors"
import db from "./config/Database"
import router from "./routes/index"
import path from "path"

import { createServer } from "http"
import { Server } from "socket.io"
import Users from "./models/UserModel"

dotenv.config()
const app = express()
const server = createServer(app)

const inDevEnv = process.env.NODE_ENV == "dev"

export const io = new Server(server, {
    cors: {
        origin: inDevEnv,
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
        origin: inDevEnv,
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
}

const userMap: Map<string, UserData> = new Map()
const readyMap: Map<string, UserData> = new Map()

function serialiseMap<K, V>(x: Map<K, V>) {
    const dMap = Object.fromEntries(x.entries())
    return dMap
}

io.on("connection", (socket) => {
    socket.on("disconnect", () => {
        userMap.delete(socket.id)
        readyMap.delete(socket.id)
    })

    socket.onAny((eventName, ...args: any) => {
        if (eventName === "message") {
            const { to, msg } = args[0]
            socket.to(to).emit("message", { from: socket.id, msg })
        } else if (eventName === "getusers") {
            const callback = args[args.length - 1]
            const dMap = serialiseMap(userMap)
            callback(dMap)
        } else if (eventName == "get_readyusers") {
            const callback = args[args.length - 1]
            const dMap = serialiseMap(readyMap)
            callback(dMap)
        } else if (eventName == "initSocket") {
            const fn = args[args.length - 1]
            const data = args[0]

            Users.findOne({
                attributes: ["elo"],
                where: {
                    username: data.username,
                },
            }).then((user) => {
                if (!user) {
                    // Got invalid username in initSocket
                    return
                }
                data.elo = user.elo
                userMap.set(String(socket.id), data)
                fn(
                    `welcome ${data.username} from SERVER [initSocket successfull]`
                )
            })
        } else if (eventName == "rmReady") {
            readyMap.delete(socket.id)
        } else if (eventName == "initReady") {
            const fn = args[args.length - 1]
            const data = args[0]

            if (!data || !data.username) {
                // Improper Data Found
                return
            } else {
                Users.findOne({
                    attributes: ["elo"],
                    where: {
                        username: data.username,
                    },
                }).then((user) => {
                    if (!user) {
                        // Got invalid username in initReady
                        return
                    }
                    data.elo = user.elo
                    readyMap.set(String(socket.id), data)
                    fn(
                        `welcome ${data.username} with elo ${data.elo} from SERVER [initReady successfull]`
                    )
                })
            }
        } else {
            if (!args || !args.length) return
            const { to } = args[0]
            if (to) {
                socket.to(to).emit(eventName, { from: socket.id, ...args[0] })
            }
        }
    })
})

const PORT = process.env.PORT || "5000"
const HOST = "0.0.0.0"

server.listen(parseInt(PORT), HOST, () => {
    console.log("Server running at port", PORT)
})
