const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Otp = require("../models/otpModel");
const { sendOtpEmail } = require("../utils/mailer");

function createUserIfNotExists(name, email, callback) {
  User.findUserByEmail(email, (err, result) => {
    if (err) return callback(err);

    if (result.length === 0) {
      // User does not exist → create new user
      User.createUser({ name, email, is_verified: 0 }, (err, res) => {
        if (err) return callback(err);
        callback(null, { created: true });
      });
    } else {
      // User already exists → do nothing
      callback(null, { created: false });
    }
  });
}

exports.signupStepOne = (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required." });
  }

  // ✅ Step 1: Insert user if not exist
  createUserIfNotExists(name, email, (err) => {
    if (err) return res.status(500).json({ error: err });

    // ✅ Step 2: Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // ✅ Step 3: Save OTP
    Otp.saveOtp(email, otp, async (err) => {
      if (err) return res.status(500).json({ error: "error" });

      try {
        // ✅ Step 4: Send OTP email
        await sendOtpEmail(email, otp);
        res.status(200).json({ message: "OTP sent to email." });
      } catch (error) {
        res.status(500).json({ error: "Failed to send OTP email 1123." });
      }
    });
  });
};

exports.setPasswordAfterVerification = (req, res) => {
  const { email, otp, password } = req.body;
  Otp.getLatestOtp(email, (err, results) => {
    if (err || results.length === 0 || results[0].otp !== otp) {
      return res.status(401).json({ message: "Invalid or expired OTP." });
    }

    const hashedPassword = bcrypt.hashSync(password, 8);
    User.setPasswordAndVerify(email, hashedPassword, (err) => {
      if (err) return res.status(500).json({ error: err });

      Otp.deleteOtp(email, () => {});
      res.json({ message: "Email verified. Password set." });
    });
  });
};

exports.login = (req, res) => {
  const { name, password } = req.body;

  User.findUserByEmail(name, (err, result) => {
    if (err || result.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = result[0];

    if (!user.password || user.is_verified === 0) {
      return res.status(401).json({ message: "Please verify your email first" });
    }

    const isMatch = bcrypt.compareSync(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ message: "Login successful", token });
  });
};
