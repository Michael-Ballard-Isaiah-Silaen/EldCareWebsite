const ScheduleRouter = require("express").Router();
const ScheduleController = require("../controllers/ScheduleController");
const Authentication = require("../middlewares/Authentication");

ScheduleRouter.use(Authentication);

ScheduleRouter.get("/", ScheduleController.getAll);
ScheduleRouter.post("/routine", ScheduleController.createRoutine);
ScheduleRouter.get("/:id", ScheduleController.getById);
ScheduleRouter.post("/", ScheduleController.create);
ScheduleRouter.put("/:id", ScheduleController.update);
ScheduleRouter.delete("/:id", ScheduleController.delete);

module.exports = ScheduleRouter;