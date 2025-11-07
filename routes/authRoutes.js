const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/signup", authController.signupStepOne);
router.post("/verify", authController.setPasswordAfterVerification);
router.post("/login", authController.login);

module.exports = router;
