import Users from "../../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sendMail from "../../modules/SendEmail.js";
import dotenv from 'dotenv'
import Sequelize from "sequelize";
dotenv.config();

const { Op } = Sequelize


export const getUsers = async (req, res) => {
    try {
        const users = await Users.findAll({
            attributes: ['id', 'name', 'email']
        });
        res.json(users);
    } catch (error) {
        console.log(error);
    }
}

export const getPasswordResetLink = async (req, res) => {
    try {
        const user = await Users.findOne({
            where: {
                email: req.body.email
            }
        }).catch((err)=>{
            res.json({msg: "Email not found"})
            console.log(err)
        })

        const userID = user.id;
        const name = user.name;
        const email = user.email;
        const password = user.password;
        const secret = password;

        const accessToken = jwt.sign({userID, name, email}, secret, {
            expiresIn: '5m'
        });


        const url = req.protocol + "://" + req.get('host') + req.originalUrl

        const resetLink = `<a target='_blank' href='${url}/${userID}/${accessToken}'>Password Reset Link</a>`
        sendMail(email, "Reset Password for Lightchess", resetLink)
            .catch((err)=>{
                console.log("EMAIL PROBLEM")
            })
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
        const email = req.body.email || ""
        const username = req.body.username || ""

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
        if (parseInt(user.role) < 1) 
            return res.status(400).json({ msg:"Email not verified"})
        const userID = user.id;
        const name = user.name;
        const accessToken = jwt.sign({userID, name, email}, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '20s'
        });
        const refreshToken = jwt.sign({userID, name, email}, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: '1d'
        });
        await Users.update({refresh_token: refreshToken}, {
            where: {
                id: userID
            }
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        });
        res.json({accessToken});
    } catch (error) {
        res.status(404).json({msg: "Internal Error"});
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
    const userID = user.id;
    await Users.update({refresh_token: null}, {
        where: {
            id: userID
        }
    });
    res.clearCookie('refreshToken');
    return res.sendStatus(200);
}
