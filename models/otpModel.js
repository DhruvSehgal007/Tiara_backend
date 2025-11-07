const db = require("../config/db");

exports.saveOtp = (email, otp, cb) => {
  db.query("INSERT INTO email_otps (email, otp) VALUES (?, ?)", [email, otp], cb);
};

exports.getLatestOtp = (email, cb) => {
  db.query("SELECT * FROM email_otps WHERE email = ? ORDER BY created_at DESC LIMIT 1", [email], cb);
};

exports.deleteOtp = (email, cb) => {
  db.query("DELETE FROM email_otps WHERE email = ?", [email], cb);
};
