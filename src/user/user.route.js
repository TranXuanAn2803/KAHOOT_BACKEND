const express = require("express");
const router = express.Router();
const authMiddleware = require("../auth/auth.middleware");
const userController = require("./user.controller");

const isAuth = authMiddleware.isAuth;
router.get("/", isAuth, async (req, res) => {
  res.send({ user: req.user });
});
router.get("/list", userController.getAllUser);

router.post(
  "/profile",
  isAuth,
  (req, res, next) => {
    console.log(JSON.stringify(req.body));
    next();
  },
  userController.HandleProfile
);

module.exports = router;
