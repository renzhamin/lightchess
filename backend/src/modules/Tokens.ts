import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

export const verifyRefreshToken = ( refreshToken ) => {
    let user = null

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
        if(err) return null;
        user = decoded
    })

    return user
}


export const verifyAccessToken = ( accessToken ) => {
    let user = null
    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if(err) return null;
        user = decoded
    })
    return user
}

export const getAccessToken = (refreshToken : string)=> {
    const user = verifyRefreshToken(refreshToken)

    if(!user) return null;

    const {id, name, email} = user

    const accessToken = jwt.sign({id, name, email}, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '5m'
    });

    return accessToken
}


export const getAccessTokenFromUserDetails = (user)=> {
    if(!user) return null;

    const {id, name, email} = user

    const accessToken = jwt.sign({id, name, email}, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '5m'
    });

    return accessToken
}

export const getRefreshToken = (user)=> {
    if(!user) return null;

    const {id, name, email} = user
    const expiresIn = user.expire || '30d'

    const refreshToken = jwt.sign({id, name, email}, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn : expiresIn
    });
    
    return refreshToken
}
