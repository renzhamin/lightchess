import Users from "../models/UserModel.js";
import bcrypt from "bcrypt";
import {validate as validateEmail} from "deep-email-validator";
import PasswordValidator from "password-validator";


export const validateRegistrationData = async (req, res, next) => {

    if (process.env.DEBUG_MODE === "1") {
        next();
    }

    const {email, password, confPassword} = req.body;

    if (!email || !password)
        return res.status(400).json({msg: "Provide credentials"});
    if (password !== confPassword)
        return res.status(400).json({msg: "Passwords don't match"});

    const schema = new PasswordValidator();
    schema.is().min(8).max(30).has().uppercase().has().lowercase().has().digits();

    if (schema.validate(password) == false) {
        return res.json(schema.validate(password, {details: true}));
    }

    const user = await Users.findOne({
        where: {
            email: email
        }
    }).catch((err) => {
        console.log(err);
        return res.json({msg: "Internal error"});
    });

    if (user) {
        return res.status(400).json({msg: "Email already exits"});
    }

    const validity = await validateEmail(email);

    if (validity.valid == false) {
        return res.json({msg: "Invalid Email"});
    }

    next();
};

export const createUser = async (req, res, next) => {
    const {name, email, password} = req.body;
    try {
        const salt = await bcrypt.genSalt();
        const hashPassword = await bcrypt.hash(password, salt);

        const createdUser = await Users.create({
            name: name,
            email: email,
            password: hashPassword
        });
        //         res.json({msg: "Register Successfull"});
        req.user = createdUser;
        next();

    } catch (error) {
        console.log(error);
    }
};

