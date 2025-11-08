// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const User = require("../models/userModel");
// const Otp = require("../models/otpModel");
// const { sendOtpEmail } = require("../utils/mailer");

// function createUserIfNotExists(name, email, callback) {
//   User.findUserByEmail(email, (err, result) => {
//     if (err) return callback(err);

//     if (result.length === 0) {
//       // User does not exist → create new user
//       User.createUser({ name, email, is_verified: 0 }, (err, res) => {
//         if (err) return callback(err);
//         callback(null, { created: true });
//       });
//     } else {
//       // User already exists → do nothing
//       callback(null, { created: false });
//     }
//   });
// }

// exports.signupStepOne = async (req, res) => {
//   console.log("✅ signupStepOne triggered");
//   console.log("📩 Received Body:", req.body);

//   const { name, email } = req.body;

//   if (!name || !email) {
//     console.log("❌ Missing name or email");
//     return res.status(400).json({ message: "Name and email are required." });
//   }

//   console.log("✅ Step 1: Creating user if not exists...");
//   createUserIfNotExists(name, email, (err) => {
//     if (err) {
//       console.log("❌ Error in createUserIfNotExists:", err);
//       return res.status(500).json({ error: err });
//     }

//     const otp = Math.floor(100000 + Math.random() * 900000);
//     console.log("✅ Step 2: OTP Generated:", otp);

//     console.log("✅ Step 3: Saving OTP in DB...");
//     Otp.saveOtp(email, otp, async (err) => {
//       if (err) {
//         console.log("❌ Otp.saveOtp error:", err);
//         return res.status(500).json({ error: "OTP save error" });
//       }

//       try {
//         console.log("✅ Step 4: Sending OTP Email...");
//         await sendOtpEmail(email, otp);
//         console.log("✅ OTP email sent successfully to:", email);

//         res.status(200).json({ message: "OTP sent to email." });
//       } catch (error) {
//         console.log("❌ Error sending OTP email:", error);
//         res.status(500).json({ error: "Failed to send OTP email." });
//       }
//     });
//   });
// };


// exports.setPasswordAfterVerification = (req, res) => {
//   const { email, otp, password } = req.body;
//   Otp.getLatestOtp(email, (err, results) => {
//     if (err || results.length === 0 || results[0].otp !== otp) {
//       return res.status(401).json({ message: "Invalid or expired OTP." });
//     }

//     const hashedPassword = bcrypt.hashSync(password, 8);
//     User.setPasswordAndVerify(email, hashedPassword, (err) => {
//       if (err) return res.status(500).json({ error: err });

//       Otp.deleteOtp(email, () => {});
//       res.json({ message: "Email verified. Password set." });
//     });
//   });
// };

// exports.login = (req, res) => {
//   const { name, password } = req.body;

//   User.findUserByEmail(name, (err, result) => {
//     if (err || result.length === 0) {
//       return res.status(400).json({ message: "Invalid email or password" });
//     }

//     const user = result[0];

//     if (!user.password || user.is_verified === 0) {
//       return res.status(401).json({ message: "Please verify your email first" });
//     }

//     const isMatch = bcrypt.compareSync(password, user.password);

//     if (!isMatch) {
//       return res.status(400).json({ message: "Invalid email or password" });
//     }

//     const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
//       expiresIn: "1h",
//     });

//     res.json({ message: "Login successful", token });
//   });
// };


const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Otp = require("../models/otpModel");
const db = require("../config/db");
const { sendOtpEmail } = require("../utils/mailer");

/* -------------------------------
   Helper: Create user if not exists
--------------------------------- */
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
      // User already exists
      callback(null, { created: false });
    }
  });
}

/* -------------------------------
   Step 1: Signup → Send OTP
--------------------------------- */
exports.signupStepOne = async (req, res) => {
  console.log("✅ signupStepOne triggered");
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required." });
  }

  createUserIfNotExists(name, email, (err) => {
    if (err) {
      return res.status(500).json({ error: err });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    console.log("✅ OTP Generated:", otp);

    Otp.saveOtp(email, otp, async (err) => {
      if (err) return res.status(500).json({ error: "OTP save error" });

      try {
        await sendOtpEmail(email, otp);
        console.log("✅ OTP email sent to:", email);
        res.status(200).json({ message: "OTP sent to email." });
      } catch (error) {
        res.status(500).json({ error: "Failed to send OTP email." });
      }
    });
  });
};

/* -------------------------------
   Step 2: Verify OTP & Set Password
--------------------------------- */
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
      res.json({ message: "Email verified. Password set successfully." });
    });
  });
};

/* -------------------------------
   Step 3: Login
--------------------------------- */
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

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ message: "Login successful", token });
  });
};

/* -------------------------------
   Step 4: Save Device ↔ Room Mapping
--------------------------------- */
exports.saveDeviceRoomMapping = (req, res) => {
  const { email, bluetooth_device_name, room_name } = req.body;

  if (!email || !bluetooth_device_name || !room_name) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const sql =
    "INSERT INTO device_mappings (user_email, bluetooth_device_name, room_name) VALUES (?, ?, ?)";

  db.query(sql, [user_email, bluetooth_device_name, room_name], (err, result) => {
    if (err) {
      console.error("❌ Error saving mapping:", err);
      return res.status(500).json({ message: "Database error" });
    }

    res.json({ message: "✅ Mapping saved successfully" });
  });
};

/* -------------------------------
   Step 5: Get All Mappings by Email
--------------------------------- */
exports.getDeviceMappings = (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ message: "Email required" });
  }

  db.query("SELECT * FROM device_mappings WHERE user_email = ?", [email], (err, results) => {
    if (err) {
      console.error("❌ Error fetching mappings:", err);
      return res.status(500).json({ message: "Database error" });
    }

    res.json({ mappings: results });
  });
};
