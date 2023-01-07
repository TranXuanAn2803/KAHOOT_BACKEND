const express = require("express");
const router = express.Router();

const presentationController = require("./presentation.controller");
const authMiddleware = require("../auth/auth.middleware");

const isAuth = authMiddleware.isAuth;
const isUser = authMiddleware.isUser;

// declare route
router.get("/owner", isAuth, presentationController.getMyOwnPrensent);

router.get("/", isAuth, presentationController.getMyPrensent);

router.get(
  "/collaborators",
  isAuth,
  presentationController.getAllCollaborators
);
router.get("/share/:id", isAuth, presentationController.getSharingPresent);
router.delete(
  "/share/:id",
  isAuth,
  presentationController.removeSharingPresent
);
router.post("/collabor/:id", isAuth, presentationController.addCollabor);

router.post("/", isAuth, presentationController.add);

router.get("/:id", isAuth, presentationController.getById);
router.post("/addCollaborator", isAuth, presentationController.addCollaborator);
router.delete("/collabor/:id", isAuth, presentationController.removeCollabor);
router.put("/collabor/:id", isAuth, presentationController.setCollaborators);
router.get("/collabor/:id", isAuth, presentationController.getColaborator);
router.put("/toggleStatus/:id", isAuth, presentationController.toggleStatus);
router.put(
  "/presenting/role/:id",
  isUser,
  presentationController.getPresentingRole
);
router.put(
  "/presenting/slide/:id",
  isUser,
  presentationController.getCurrentSlide
);
router.put(
  "/presenting/session/:id",
  isUser,
  presentationController.getCurrentSession
);

router.put("/share/:id", isAuth, presentationController.sharePresent);

router.put("/:id", isAuth, presentationController.update);
router.delete("/:id", isAuth, presentationController.deleteById);
router.delete("/", isAuth, presentationController.bulkDelete);
router.delete(
  "/collaborator/:idPresentation/:collaborator",
  isAuth,
  presentationController.deleteCollaborator
);

module.exports = router;
