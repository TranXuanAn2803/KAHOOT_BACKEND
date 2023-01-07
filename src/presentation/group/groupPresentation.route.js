const express = require("express");
const router = express.Router();

const authMiddleware = require("../../auth/auth.middleware");
const GroupPresentationController = require("./groupPresentation.controller");
const isAuth = authMiddleware.isAuth;
const isUser = authMiddleware.isUser;

router.get("/:id", isAuth, GroupPresentationController.getGroupPresentation);

module.exports = router;
