const express = require("express");
const router = express.Router();

const slideController = require("./slide.controller");
const authMiddleware = require("../auth/auth.middleware");

const isAuth = authMiddleware.isAuth;

// declare route
// router.get("/test1/:id", isAuth, slideController.test1);
// router.get("/test2/:id", isAuth, slideController.test2);

router.get("/by-present/:id", isAuth, slideController.getByPresent);
router.get("/:id", isAuth, slideController.getById);
router.post("/", isAuth, slideController.createSlide);
router.post("/:id", isAuth, slideController.updateMutiSlide);
router.delete("/:id", isAuth, slideController.deleteById);

module.exports = router;