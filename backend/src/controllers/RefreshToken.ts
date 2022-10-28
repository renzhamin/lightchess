import { getAccessToken } from "../modules/Tokens"

export const refreshToken = async (req, res) => {
    const refreshToken = req.cookies.refreshToken
    if (!refreshToken) {
        return res.status(401).json({ msg: "No cookie" })
    }

    const accessToken = getAccessToken(refreshToken)

    if (accessToken) return res.json({ accessToken })

    res.clearCookie("refreshToken")
    return res.status(401).json({ msg: "refreshToken is invalid" })
}
