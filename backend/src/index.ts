import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import db from "./config/Database"
import router from "./routes/index"
import path from "path"

import { createServer } from "http"
import { Server } from "socket.io"
import Users from "./models/UserModel"

dotenv.config()
const app = express()
const server = createServer(app)

export const io = new Server(server)
;(async () => {
    try {
        await db.sync()
        await db.authenticate()
        console.log("Database Connected...")
    } catch (error) {
        console.error(error)
    }
})()

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
const socketMap: Map<string, string> = new Map()

function serialiseMap<K, V>(x: Map<K, V>) {
    const dMap = Object.fromEntries(x.entries())
    return dMap
}

io.on("connection", (socket) => {
    socket.on("disconnect", () => {
        const username = userMap.get(String(socket.id))?.username
        if (username) {
            socketMap.delete(username)
        }
        userMap.delete(String(socket.id))
        readyMap.delete(String(socket.id))
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
            if (userMap.get(String(socket.id))) {
                return
            }
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
                socketMap.set(data.username, String(socket.id))
                fn(
                    `welcome ${data.username} from SERVER [initSocket successfull]`
                )
            })
        } else if (eventName == "rmReady") {
            readyMap.delete(String(socket.id))
        } else if (eventName == "initReady") {
            if (readyMap.get(String(socket.id))) return
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
            let { to } = args[0]
            to = socketMap.get(to)
            const senderUsername = userMap.get(String(socket.id))?.username
            if (to) {
                socket
                    .to(to)
                    .emit(eventName, { ...args[0], from: senderUsername })
            }
        }
    })
})

const PORT = process.env.PORT || "5000"
const HOST = "0.0.0.0"

server.listen(parseInt(PORT), HOST, () => {
    console.log("Server running at port", PORT)
})
