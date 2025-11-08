const db = require("../config/db");

// exports.findUserByEmail = (email, cb) => {
//   db.query("SELECT * FROM users WHERE name = ?", [email], cb);
// };

exports.findUserByEmail = (email, cb) => {
  db.query("SELECT * FROM users WHERE email = ?", [email], cb);
};


exports.createUser = (userData, cb) => {
  db.query("INSERT INTO users SET ?", userData, cb);
};

exports.setPasswordAndVerify = (email, hashedPassword, cb) => {
  db.query("UPDATE users SET password = ?, is_verified = 1 WHERE email = ?", [hashedPassword, email], cb);
};
