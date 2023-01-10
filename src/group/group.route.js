const express = require("express");
const router = express.Router();

const groupController = require("./group.controller");
const authMiddleware = require("../auth/auth.middleware");

const isAuth = authMiddleware.isAuth;

// declare route
router.get("/", isAuth, groupController.getMyGroup);
router.get("/member/:id", isAuth, groupController.getGroupMember);
router.get("/owner", isAuth, groupController.getMyOwnerGroup);
router.post("/:id", isAuth, groupController.addMember);
router.post("/", isAuth, groupController.createGroup);
router.post("/toggleRole/:id", isAuth, groupController.toggleRole);
router.delete("/member/:id", isAuth, groupController.deleteMember);
router.get("/join/:id", isAuth, groupController.joinGroup);
router.get("/escape/:id", isAuth, groupController.exitGroup);
router.get("/isMember/:id", isAuth, groupController.isMember);
router.post("/sendInvitation/:id", isAuth, groupController.sendInvitationMail);
router.get("/confirmMail/:id", isAuth, groupController.confirmMail);
router.get("/:id", isAuth, groupController.getAGroup);
router.delete("/:id", isAuth, groupController.deleteGroup);

module.exports = router;
