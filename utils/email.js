const nodemailer = require('nodemailer');

const sendEmail = options =>{
    //1 create transporter
    const transporter = nodemailer.createTransport({
        host: 'Gmail',
        auth: {

        }
    })
}