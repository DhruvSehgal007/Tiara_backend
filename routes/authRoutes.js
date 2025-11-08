// const express = require("express");
// const router = express.Router();
// const authController = require("../controllers/authController");

// router.post("/signup", authController.signupStepOne);
// router.post("/verify", authController.setPasswordAfterVerification);
// router.post("/login", authController.login);

// module.exports = router;


const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/signup", authController.signupStepOne);
router.post("/verify", authController.setPasswordAfterVerification);
router.post("/login", authController.login);
router.post("/save-mapping", authController.saveDeviceRoomMapping);
router.get("/get-mappings", authController.getDeviceMappings);

module.exports = router;
