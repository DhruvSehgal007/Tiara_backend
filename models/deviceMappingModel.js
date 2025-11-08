const db = require("../config/db");

exports.saveOrUpdateMapping = (userId, deviceName, customName, cb) => {
  const checkQuery = "SELECT * FROM device_mappings WHERE user_id = ? AND device_name = ?";
  db.query(checkQuery, [userId, deviceName], (err, results) => {
    if (err) return cb(err);

    if (results.length > 0) {
      // Update existing mapping
      const updateQuery = "UPDATE device_mappings SET custom_name = ? WHERE user_id = ? AND device_name = ?";
      db.query(updateQuery, [customName, userId, deviceName], cb);
    } else {
      // Insert new mapping
      const insertQuery = "INSERT INTO device_mappings (user_id, device_name, custom_name) VALUES (?, ?, ?)";
      db.query(insertQuery, [userId, deviceName, customName], cb);
    }
  });
};

exports.getMappingByDeviceName = (userId, deviceName, cb) => {
  const query = "SELECT * FROM device_mappings WHERE user_id = ? AND device_name = ?";
  db.query(query, [userId, deviceName], cb);
};
