import Users from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sendMail from "../modules/SendEmail.js";

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

export const Register = async (req, res, next) => {
    const {name, email, password, confPassword} = req.body;
    if (!email || !password) return res.status(400).json({msg: "Provide credentials"})
    if (password !== confPassword) return res.status(400).json({msg: "Passwords don't match"});
    try {
        const user = await Users.findOne({
            where : {
                email : email
            }
        })
        if(user){
            return res.status(400).json({msg:"Email already exits"})
        } 

        const salt = await bcrypt.genSalt();
        const hashPassword = await bcrypt.hash(password, salt);

        const createdUser = await Users.create({
            name: name,
            email: email,
            password: hashPassword
        });
//         res.json({msg: "Register Successfull"});
        req.user = createdUser
        next()

    } catch (error) {
        console.log(error);
    }
}


export const getEmailVerificationLink = async (req, res) => {
    try {
        const userID = req.user.id;
        const name = req.user.name;
        const email = req.user.email;
        const password = req.user.password;
        const secret = password;

        console.log(name, email, password)

        const accessToken = jwt.sign({userID, name, email}, secret, {
            expiresIn: '30d'
        });


        const url = req.protocol + "://" + req.get('host') + req.originalUrl

        const verificationLink = `<a target='_blank' href='${url}/${userID}/${accessToken}'>Verify your email</a>`
        await sendMail(email, "Lightchess account verification", verificationLink)
            .catch((err)=>{
                res.json({msg : "Invalid Email"})
                console.log(err)
            })
        res.json({msg:"Register successful, please verify your email before login"})

    } catch (error) {
        res.status(400).json({msg: "Register failed"});
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

export const verifyEmail = async (req,res) => {
    try {
        await Users.update({ role : 1 }, { where: { id : req.params.userID } })
        res.json({msg : "Email verification successful"})
   } catch (error) {
       res.json({msg: "couldnt verify email"})
       console.log(error)
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
        if (!match) 
            return res.status(400).json({msg: "Wrong Password"});
        if (parseInt(user.role) < 1) 
            return res.status(400).json({ msg:"Email not verified"})
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
