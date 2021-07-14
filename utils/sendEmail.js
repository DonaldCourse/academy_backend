"use strict";
const nodemailer = require("nodemailer");

// async..await is not allowed in global scope, must use a wrapper
const sendEmail = async (options) => {

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service: 'Gmail',
    host: process.env.SMTP_HOTS,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_EMAIL, // generated ethereal user
      pass: process.env.SMTP_PASSWORD, // generated ethereal password
    },
  });

  // send mail with defined transport object
  let message = {
    from: `${process.env.FROM_EMAIL} <${process.env.FROM_NAME}>`, // sender address
    to: options.email, // list of receivers
    subject: options.subject, // Subject line
    text: 'You recieved message from ' + options.email,
    html: `<div>
      <p>${options.text}
      </p>
      <a href="${options.url}">${options.url}</a>
    </div>`,
  };

  const info = await transporter.sendMail(message);

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
}

module.exports = sendEmail;