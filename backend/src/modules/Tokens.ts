import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

export const verifyToken = ( token ) => {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if(err) return null;
        return decoded;
    })
    return null
}

export const getAccessToken = (token)=> {
    const user = verifyToken(token)

    if(!user) return null;

    const {id, name, email} = user

    const accessToken = jwt.sign({id, name, email}, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '5m'
    });

    return accessToken
}
