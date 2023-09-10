import nodeCache from "node-cache"
import Users from "../models/UserModel"

export const get_url_from_req = (req) => {
    const url = req.protocol + "://" + req.get("host") + req.originalUrl
    return url
}

export const eloCache = new nodeCache({
    stdTTL: 60 * 5,
})

export async function getEloFromCache(username: string): Promise<Number> {
    let elo = eloCache.get(username) as Number
    if (elo) return elo

    const user = await Users.findOne({
        attributes: ["elo"],
        where: {
            username: username,
        },
    })

    if (user?.elo) {
        elo = user.elo
        eloCache.set(username, elo)
    }

    return elo ?? 1200
}
