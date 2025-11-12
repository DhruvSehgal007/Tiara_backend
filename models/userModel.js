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

exports.saveDeviceRoomMapping = (email, bluetooth_device_name, room_name, callback) => {
  const sql = `
    INSERT INTO device_mappings (user_email, bluetooth_device_name, room_name)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [email, bluetooth_device_name, room_name], (err, result) => {
    if (err) {
      console.error('❌ Error saving mapping:', err);
      return callback(err, null);
    }
    callback(null, result);
  });
};
