import Users from "../models/UserModel";
import jwt from "jsonwebtoken";
import {getAccessToken} from "../modules/Tokens";

export const refreshToken = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(401);

    const accessToken = getAccessToken(refreshToken)

    if(accessToken)
        return res.json({accessToken})

    return res.status(404).json({msg:"Invalid token"})
}
