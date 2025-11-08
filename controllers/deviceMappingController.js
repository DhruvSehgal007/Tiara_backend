const DeviceMapping = require("../models/deviceMappingModel");

exports.saveDeviceMapping = (req, res) => {
  const { device_name, custom_name } = req.body;
  const userId = req.user.id; // comes from JWT (middleware)

  if (!device_name || !custom_name) {
    return res.status(400).json({ message: "Device name and custom name are required." });
  }

  DeviceMapping.saveOrUpdateMapping(userId, device_name, custom_name, (err) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json({ message: "Mapping saved successfully." });
  });
};

exports.getDeviceMapping = (req, res) => {
  const userId = req.user.id;
  const { device_name } = req.params;

  DeviceMapping.getMappingByDeviceName(userId, device_name, (err, results) => {
    if (err) return res.status(500).json({ error: err });

    if (results.length === 0) {
      return res.status(404).json({ message: "No mapping found for this device." });
    }

    res.status(200).json(results[0]);
  });
};
