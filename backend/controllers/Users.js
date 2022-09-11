import Users from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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

export const Register = async (req, res) => {
    const {name, email, password, confPassword} = req.body;
    if (!email || !password) return res.status(400).json({msg: "Provide credentials"})
    if (password !== confPassword) return res.status(400).json({msg: "Passwords don't match"});
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);
    try {
        await Users.create({
            name: name,
            email: email,
            password: hashPassword
        });
        res.json({msg: "Register Successfull"});
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
        });

        const userID = user.id;
        const name = user.name;
        const email = user.email;
        const password = user.password;
        const secret = password;


        const accessToken = jwt.sign({userID, name, email}, secret, {
            expiresIn: '5m'
        });


        const url = req.protocol + "://" + req.get('host') + req.originalUrl

        res.send(`<a href=${url}/${userID}/${accessToken}>Reset Password</a>`)
        console.log(req.originalUrl)

    } catch (error) {
        res.status(400).json({msg: "Email not found"});
    }
}

export const getPasswordResetPage = (req, res) => {

    const {userID, passwordResetToken} = req.params

    res.send(`<form action="/resetpassword/${userID}/${passwordResetToken}" method="POST">
        <input type="password" name="password" value="" placeholder="Enter your new password..." /> 
        <input type="submit" value="Reset Password" />
    </form>`);
}

export const resetPassword = async (req, res) => {
    try {
        const {password} = req.body;
        if (!password) return res.send("No data")
        const salt = await bcrypt.genSalt();
        const hashPassword = await bcrypt.hash(password, salt);

        await Users.update({password: hashPassword, refresh_token: null}, {
            where: {
                id: req.userID
            }
        })
        res.json({msg: "Password Reset Successfull"});


    } catch (error) {
        res.status(404).send("Failed to reset password")
    }
}


export const Login = async (req, res) => {
    try {
        const user = await Users.findOne({
            where: {
                email: req.body.email
            }
        });
        if (!req.body.password) {
            return res.status(400).json({msg: "Password field empty"});
        }

        const match = await bcrypt.compare(req.body.password, user.password);
        if (!match) return res.status(400).json({msg: "Wrong Password"});
        const userID = user.id;
        const name = user.name;
        const email = user.email;
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
        res.status(404).json({msg: "Email not found"});
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
