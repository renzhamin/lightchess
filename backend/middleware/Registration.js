import Users from "../models/UserModel.js";
import bcrypt from "bcrypt";
import {validate as validateEmail} from "deep-email-validator";
import PasswordValidator from "password-validator";
import { Sequelize } from "sequelize";
import dotenv from 'dotenv'
const { Op } = Sequelize

dotenv.config()

export const validateRegistrationData = async (req, res, next) => {

    const {email, username, password, confPassword} = req.body;

    if (!password)
        return res.status(400).json({msg: "Provide password"});

    if(!username)
        return res.status(400).json({msg : "Provide username"})

    if(!email)
        return res.status(400).json({msg : "Provide email"})

    let user = await Users.findOne({
        where: {
            [Op.or] : [
                { email : email },
                { username : email }
            ]
        }
    }).catch((err)=>{
        console.log(err)
        console.log("Error quering if email already exists")
        return res.json({msg : "Internal Error"})
    });

    if(user)
        return res.status(400).json({msg : "Email already in use"})

    user = null;
    user = await Users.findOne({
        where: {
            [Op.or] : [
                { username : username },
                { email : username }
            ]
        }
    }).catch((err)=>{
        console.log(err)
        console.log("Error quering if username already exists")
        return res.json({msg : "Internal Error"})
    });

    if (user) {
        return res.status(400).json({msg: "username already in use"});
    }



    if (process.env.DEBUG_MODE == "1") {
        return next();
    }


    if (password !== confPassword)
        return res.status(400).json({msg: "Passwords don't match"});

    const schema = new PasswordValidator();
    schema.is().min(8).max(30).has().uppercase().has().lowercase().has().digits();

    if (schema.validate(password) == false) {
        return res.json(schema.validate(password, {details: true}));
    }


    const validity = await validateEmail(email);

    if (validity.valid == false) {
        return res.json({msg: "Invalid Email"});
    }

    next();
};

export const createUser = async (req, res, next) => {
    const {name, username, email, password} = req.body;
    try {
        const salt = await bcrypt.genSalt();
        const hashPassword = await bcrypt.hash(password, salt);
        const createdUser = await Users.create({
            name: name,
            username : username,
            email: email,
            password: hashPassword
        }).catch((err)=>{
            console.log(err, "Failed to create user")
            return res.json({msg : "Error creating user"})
        });
        req.user = createdUser;
        next();

    } catch (error) {
        console.log(error);
    }
};

