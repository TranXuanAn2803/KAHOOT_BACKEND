const express = require("express");
const router = express.Router();

const authController = require("./auth.controller");

// declare route
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh", authController.refreshToken);
router.post("/google", authController.googleLogin);
router.get("/confirm/:confirmationCode", authController.verifyEmail);
module.exports = router;
