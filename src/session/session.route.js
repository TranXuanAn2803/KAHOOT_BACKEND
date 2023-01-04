const express = require("express");
const { isAuth } = require("../auth/auth.middleware");
const sessionController = require("./session.controller");
const router = express.Router();

router.post("/", sessionController.HandleSession);

module.exports = router;