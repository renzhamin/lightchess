import nodemailer from "nodemailer";
import * as dotenv from 'dotenv';
dotenv.config({path: process.cwd() + "/../.env"});

const sendMail = async (receiverEmail, subject, body) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.lightchessEmail,
            pass: process.env.lightchessEmailPass
        }
    });

    const mailOptions = {
        from: process.env.lightchessEmail,
        to: receiverEmail,
        subject: subject,
        html: body
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

export default sendMail;
