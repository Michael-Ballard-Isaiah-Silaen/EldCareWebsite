const NotificationRouter = require("express").Router();
const NotificationController = require("../controllers/NotificationController");
const Authentication = require("../middlewares/Authentication");

NotificationRouter.use(Authentication);

NotificationRouter.get("/", NotificationController.getAll);
NotificationRouter.get("/:id", NotificationController.getById);
NotificationRouter.post("/", NotificationController.create);
NotificationRouter.put("/:id", NotificationController.update);
NotificationRouter.delete("/:id", NotificationController.delete);

module.exports = NotificationRouter;