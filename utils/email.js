const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  //1 create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    logger: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  //2) Define email options
  const mailOptions = {
    from: 'Michal Zadlo <michal@zadlo.pl>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };
  console.log(mailOptions);
  //send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
