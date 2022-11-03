import nodemailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config()

const sendMail = async (receiverEmail, subject, body) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.lightchessEmail,
            pass: process.env.lightchessEmailPass,
        },
    })

    const mailOptions = {
        from: process.env.lightchessEmail,
        to: receiverEmail,
        subject: subject,
        html: body,
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log("Failed to send email to", receiverEmail)
        } else {
            console.log("Email sent: " + info.response)
        }
    })
}

export default sendMail
