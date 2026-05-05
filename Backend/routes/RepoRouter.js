const RepoRouter = require("express").Router();
const RepoController = require("../controllers/RepoController");
const Authentication = require("../middlewares/Authentication");
const MulterUpload = require("../helpers/MulterUpload");

RepoRouter.use(Authentication);

RepoRouter.get("/", RepoController.getAll);
RepoRouter.get("/:id", RepoController.getById);
RepoRouter.post("/", RepoController.create);
RepoRouter.put("/:id", RepoController.update);
RepoRouter.delete("/:id", RepoController.delete);
RepoRouter.post("/:id/documents", MulterUpload.single("file"), RepoController.uploadDocument);
RepoRouter.delete("/:id/documents/:docId", RepoController.deleteDocument);

module.exports = RepoRouter;