const nodemailer = require("nodemailer");
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER || "shahbishwa21@gmail.com",
    pass: process.env.GMAIL_PASS || "yvgn stcq deoh reko",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

async function sendMail(email, message) {
  await transporter.sendMail({
    to: email,
    subject: "your email status",
    text: message,
  });
}

module.exports = { sendMail };
