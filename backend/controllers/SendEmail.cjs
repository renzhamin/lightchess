const nodemailer = require('nodemailer');
require('dotenv').config({path: __dirname + "/../.env"});
console.log(process.env);

const sendMail = (receiverEmail, subject, body) => {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.lightchessEmail,
            pass: process.env.lightchessEmailPass
        }
    });

    var mailOptions = {
        from: process.env.lightchessEmail,
        to: receiverEmail,
        subject: subject,
        text: body
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

module.exports = {sendMail};
