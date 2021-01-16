const nodemailer = require('nodemailer');



const sendEmail =async options => {

    // Create a  transpoter
const transpoter = nodemailer.createTransport({
    host:process.env.EMAIL_HOST,
    port:process.env.EMAIL_PORT,
    auth:{
        user:process.env.EMAIL_USERNAME,
        pass:process.env.EMAIL_PASSWORD,
    }


    //If service = GMAIL activate "less secure app option"
})



    //Define the email options

    const mailOptions = {
        from: 'Amadi Austin <hello@rexsteroxy22@gmail.com',
        to: options.email,
        subject: options.subject,
        text: options.message,
    }


    // Then send the email

    await transpoter.sendMail(mailOptions)
}

module.exports = sendEmail;