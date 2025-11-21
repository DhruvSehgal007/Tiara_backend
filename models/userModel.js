const db = require("../config/db");

// exports.findUserByEmail = (email, cb) => {
//   db.query("SELECT * FROM users WHERE name = ?", [email], cb);
// };

exports.findUserByEmail = (email, cb) => {
  db.query("SELECT * FROM users WHERE email = ?", [email], cb);
};

exports.getUser = (id , cb)=>{
  db.query("SELECT * FROM users WHERE id = ?", [id], cb);
}
exports.createUser = (userData, cb) => {
  db.query("INSERT INTO users SET ?", userData, cb);
};

exports.setPasswordAndVerify = (email, hashedPassword, cb) => {
  db.query("UPDATE users SET password = ?, is_verified = 1 WHERE email = ?", [hashedPassword, email], cb);
};


exports.saveDeviceRoomMapping = (email, bluetooth_device_name, room_name, callback) => {
  // Step 1: Get user_id from users table by email
  const findUserSql = "SELECT id FROM users WHERE email = ?";
  db.query(findUserSql, [email], (err, userResult) => {
    if (err) {
      console.error("❌ Error finding user ID:", err);
      return callback(err, null);
    }

    if (userResult.length === 0) {
      return callback(new Error("User not found"), null);
    }

    const user_id = userResult[0].id;

    // Step 2: Insert mapping with user_id
    const insertSql = `
      INSERT INTO device_mappings (user_id, user_email, bluetooth_device_name, room_name)
      VALUES (?, ?, ?, ?)
    `;

    db.query(insertSql, [user_id, email, bluetooth_device_name, room_name], (err, result) => {
      if (err) {
        console.error("❌ Error saving mapping:", err);
        return callback(err, null);
      }
      callback(null, result);
    });
  });
};




exports.getUserDeviceMappings = (email, callback) => {
  const sql = `
    SELECT 
      user_id, 
      user_email, 
      bluetooth_device_name, 
      room_name, 
      created_at
    FROM device_mappings
    WHERE user_email = ?
  `;

  db.query(sql, [email], (err, result) => {
    if (err) {
      console.error("❌ Error fetching mappings:", err);
      return callback(err, null);
    }
    callback(null, result);
  });
};


exports.saveMode = (
  user_id,
  bluetooth_device_name,
  room_name,
  start_time,
  end_time,
  run_time,
  stop_time,
  selected_days,
  total_hours,
  callback
) => {

  const sql = `
    INSERT INTO mode_lists
    (user_id, bluetooth_device_name, room_name, start_time, end_time, run_time, stop_time, selected_days, total_hours, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;

  db.query(sql, [
    user_id,
    bluetooth_device_name,
    room_name,
    start_time,
    end_time,
    run_time,
    stop_time,
    selected_days,
    total_hours
  ], callback);
};



exports.updateMode = (
  id,
  start_time,
  end_time,
  run_time,
  stop_time,
  selected_days,
  total_hours,
  callback
) => {

  const sql = `
    UPDATE mode_lists
    SET start_time=?, end_time=?, run_time=?, stop_time=?, selected_days=?, total_hours=?
    WHERE id=?
  `;

  db.query(sql, [
    start_time,
    end_time,
    run_time,
    stop_time,
    selected_days,
    total_hours,
    id
  ], callback);
};


exports.getModes = (user_id, bluetooth_name, callback) => {
  const sql = `
    SELECT *
    FROM mode_lists
    WHERE user_id = ? AND bluetooth_device_name = ?
    ORDER BY id DESC
  `;

  db.query(sql, [user_id, bluetooth_name], callback);
};


exports.toggleMode = (id, user_id, bluetooth_name, callback) => {

  // Step 1: Deactivate all modes for this device
  const sql1 = `
    UPDATE mode_lists 
    SET is_active = 0 
    WHERE user_id = ? AND bluetooth_device_name = ?
  `;

  // Step 2: Activate selected mode neww
  const sql2 = `
    UPDATE mode_lists 
    SET is_active = 1 
    WHERE id = ? AND user_id = ? AND bluetooth_device_name = ?
  `;

  db.query(sql1, [user_id, bluetooth_name], (err) => {
    if (err) return callback(err);

    db.query(sql2, [id, user_id, bluetooth_name], callback);
  });
};




const saveUserData = (user_id, first_name, last_name, phone, email, callback) => {
    const query = `
        INSERT INTO user_data (user_id, first_name, last_name, phone, email) 
        VALUES (?, ?, ?, ?, ?)
    `;
    db.query(query, [user_id, first_name, last_name, phone, email], (err, result) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, result);
    });
};
