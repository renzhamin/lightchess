import jwt from "jsonwebtoken";
import sendMail from "../modules/SendEmail";


export const sendEmailVerificationLink = async (req, res) => {
    const userID = req.user.id;
    const name = req.user.name;
    const email = req.user.email;
    const password = req.user.password;
    const secret = password;

    console.log(name, email, password);

    const accessToken = jwt.sign({userID, name, email}, secret, {
        expiresIn: '30d'
    });

    const url = req.protocol + "://" + req.get('host') + req.originalUrl;

    const verificationLink = `<a target='_blank' href='${url}/${userID}/${accessToken}'>Verify your email</a>`;
    await sendMail(email, "Lightchess account verification", verificationLink)
    return res.json({msg: "Register successful, please verify your email before login"});
};

