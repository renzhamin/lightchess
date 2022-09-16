import jwt from "jsonwebtoken";
import sendMail from "../modules/SendEmail.js";


export const completeRegistration = async (req, res) => {
    try {
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
            .catch((err) => {
                res.json({msg: "Invalid Email"});
                console.log(err);
            });
        res.json({msg: "Register successful, please verify your email before login"});

    } catch (error) {
        res.status(400).json({msg: "Register failed"});
    }
};

