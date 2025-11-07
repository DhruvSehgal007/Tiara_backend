const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false // ✅ Fix self-signed certificate issue
  }
});

exports.sendOtpEmail = (to, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "Your OTP for Tiara Verification",
    text: `Your OTP code is: ${otp}`
  };

  return transporter.sendMail(mailOptions);
};
