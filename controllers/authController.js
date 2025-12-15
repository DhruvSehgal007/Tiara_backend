

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Otp = require("../models/otpModel");
const db = require("../config/db");
const { sendOtpEmail } = require("../utils/mailer");
const ModeModel = require('../models/userModel');


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

exports.login = (req, res) => {
  const { email, password } = req.body; // ✅ correct: use email, not name hello

  User.findUserByEmail(email, (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Server error. Please try again." });
    }

    if (result.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = result[0];

    if (!user.password) {
      return res.status(400).json({ message: "User has no password set" });
    }

    if (user.is_verified === 0) {
      return res.status(401).json({ message: "Please verify your email first" });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
    });
  });
};

exports.getUserDetails = (req, res) => {
    const { user_id } = req.body;
    console.log("Received user_id:", user_id);

    User.getUser(user_id, (err, result) => {
        console.log("DB result:", result);   // add this

        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Server error. Please try again." });
        }

        if (result.length > 0) {
            return res.json({ message: "User Details Successfully fetched", data: result });
        }

        return res.json({ message: "User not found", data: [] });
    });
},

exports.saveDeviceRoomMapping = (req, res) => {
  const { email, bluetooth_device_name, room_name } = req.body;

  if (!email || !bluetooth_device_name || !room_name) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  User.saveDeviceRoomMapping(email, bluetooth_device_name, room_name, (err, result) => {
    if (err) {
      console.error("Error in controller:", err);
      return res.status(500).json({ message: err.message || "Database error" });
    }

    res.json({ message: "Mapping saved successfully", data: result });
  });
};

exports.getDeviceMappings = (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  User.getUserDeviceMappings(email, (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    res.json({
      message: "✅ Device mappings fetched",
      data: result,
    });
  });
};

exports.saveMode = (req, res) => {
  const {
    mode_id,
    user_id,
    bluetooth_name,
    room_name,
    start_time,
    end_time,
    run_time,
    stop_time,
    days,
    total_hours
  } = req.body;

  const startSQL = `${String(start_time).padStart(2, '0')}:00:00`;
  const endSQL = `${String(end_time).padStart(2, '0')}:00:00`;

  if (mode_id) {
    ModeModel.updateMode(
      mode_id,
      startSQL,
      endSQL,
      run_time,
      stop_time,
      days,
      total_hours,
      (err) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: "Updated" });
      }
    );
  } else {
    ModeModel.saveMode(
      user_id,
      bluetooth_name,
      room_name,
      startSQL,
      endSQL,
      run_time,
      stop_time,
      days,
      total_hours,
      (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: "Inserted", mode_id: result.insertId });
      }
    );
  }
};

exports.getModes = (req, res) => {
  const { user_id, bluetooth_name } = req.query;

  ModeModel.getModes(user_id, bluetooth_name, (err, results) => {
    if (err) {
      console.log("GET MODES ERROR:", err);
      return res.status(500).json({ error: err });
    }

    res.json({ modes: results });
  });
};

exports.toggleMode = (req, res) => {
  const { id, user_id, bluetooth_name } = req.body;

  if (!id || !user_id || !bluetooth_name) {
    return res.status(400).json({ message: "Missing fields" });
  }

  // Make this mode active, others inactive NEW Again New
  ModeModel.toggleMode(id, user_id, bluetooth_name, (err) => {
    if (err) return res.status(500).json({ message: "DB Error", err });
    res.json({ message: "Mode toggled" });
  });
};






exports.saveUserProfile = (req, res) => {
    const { user_id, first_name, last_name, phone, email } = req.body;

    // Log data to check what is being received
    console.log("Received data:", req.body);

    // Call the saveUserData function from the ModeModel huhuh
    ModeModel.saveUserData(user_id, first_name, last_name, phone, email, (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Server error. Please try again." });
        }

        // Send response after successful save
        return res.json({ message: "Profile saved successfully", data: result });
    });
};