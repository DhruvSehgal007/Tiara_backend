const express = require("express");
const router = express.Router();
const deviceMappingController = require("../controllers/deviceMappingController");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/save", verifyToken, deviceMappingController.saveDeviceMapping);
router.get("/get/:device_name", verifyToken, deviceMappingController.getDeviceMapping);

module.exports = router;
