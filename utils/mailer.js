const nodemailer = require("nodemailer");
require("dotenv").config();

console.log("✅ Setting up SMTP transporter...");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


// ✅ Verify transporter (Important for live server)
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ SMTP Transporter Error:", error);
  } else {
    console.log("✅ SMTP Transporter is ready.");
  }
});

exports.sendOtpEmail = async (to, otp) => {
  console.log("📨 Preparing OTP email to:", to);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "Your OTP for Tiara Verification",
    text: `Your OTP code is: ${otp}`
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log("✅ Mail sent:", result);
    return result;
  } catch (error) {
    console.log("❌ sendMail failed:", error);
    throw error;
  }
};
