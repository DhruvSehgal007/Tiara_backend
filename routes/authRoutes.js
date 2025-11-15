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
router.post('/save-mode', authController.saveMode);
router.get('/get-modes', authController.getModes);
router.post('/toggle-mode', authController.toggleMode);


module.exports = router;
