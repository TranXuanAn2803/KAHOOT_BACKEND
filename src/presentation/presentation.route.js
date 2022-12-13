const express = require("express");
const router = express.Router();

const presentationController = require("./presentation.controller");
const authMiddleware = require("../auth/auth.middleware");

const isAuth = authMiddleware.isAuth;

// declare route
router.get("/", isAuth, presentationController.getMyPresentation);
router.get("/:id", isAuth, presentationController.getPresentationById);
router.post("/", isAuth, presentationController.add);
router.put("/:id", isAuth, presentationController.update);

router.delete("/:id", isAuth, presentationController.deleteById);

module.exports = router;
