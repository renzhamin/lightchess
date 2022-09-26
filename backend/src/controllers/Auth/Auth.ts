import Users from "../../models/UserModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sendMail from "../../modules/SendEmail";
import dotenv from 'dotenv'
import Sequelize from "sequelize";
import {getAccessTokenFromUserDetails, getRefreshToken, verifyAccessToken, verifyRefreshToken} from "../../modules/Tokens";
dotenv.config();

const { Op } = Sequelize


export const getUsers = async (req, res) => {
    try {
        const users = await Users.findAll({
            attributes: ['id', 'name', 'email']
        });
        return res.json(users);
    } catch (error) {
        console.log(error);
    }
}

export const getPasswordResetLink = async (req, res) => {
    try {
        const user : Users = await Users.findOne({
            where: {
                email: req.body.email
            }
        })

        if(!user)
            return res.json({msg: "Email not found"})

        const {id, name, email} = user;
        const secret = user.password;

        const accessToken = jwt.sign({id, name, email}, secret, {
            expiresIn: '5m'
        });


        const url = req.protocol + "://" + req.get('host') + req.originalUrl

        const resetLink = `<a target='_blank' href='${url}/${id}/${accessToken}'>Password Reset Link</a>`
        sendMail(email, "Reset Password for Lightchess", resetLink)
        res.json({msg:"Email sent"})

    } catch (error) {
        res.status(400).json({msg: "Failed to send email"});
    }
}

export const getPasswordResetPage = (req, res) => {

    const {userID, token} = req.params

    res.send(`<form action="/resetpassword/${userID}/${token}" method="POST">
             <input type="password" name="password" value="" placeholder="Enter your new password..." /> 
             <input type="submit" value="Reset Password" />
             </form>`);
}

export const Login = async (req, res) => {
    try {
        let email = req.body.email || ""
        let username = req.body.username || ""

        const user = await Users.findOne({
            where: {
                [Op.or] : [
                    { email : email },
                    { username : email },
                    { username : username }
                ]
            }
        }).catch((err)=>{
            console.log(err)
            return res.json({msg : "Internal Error"})
        });

        if(!user){
            return res.status(400).json({ msg:"User doesn't exist" })
        }
        if (!req.body.password) {
            return res.status(400).json({msg: "Password field empty"});
        }

        const match = await bcrypt.compare(req.body.password, user.password);
        if (!match) 
            return res.status(400).json({msg: "Wrong Password"});

        if(process.env.DEBUG_MODE != "1"){
            if (parseInt(user.role) < 1) 
                return res.status(400).json({ msg:"Email not verified"})
        }

        const { id,name } = user
        email = user.email


        const accessToken = getAccessTokenFromUserDetails({id,name,email})
        const refreshToken = getRefreshToken({id,name,email})

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 30 * 1000
        });

        return res.json({accessToken});

    } catch (error) {
        return res.status(404).json({msg: "Internal Error"});
    }
}

export const Logout = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(204);
    const user = await Users.findOne({
        where: {
            refresh_token: refreshToken
        }
    });
    if (!user) return res.sendStatus(204);

    await Users.update({refresh_token: null}, {
        where: {
            id: user.id
        }
    });

    res.clearCookie('refreshToken');
    
    return res.sendStatus(200);
}
