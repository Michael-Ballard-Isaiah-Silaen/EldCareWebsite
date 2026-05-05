const MedBoxRouter = require("express").Router();
const MedBoxController = require("../controllers/MedBoxController");
const Authentication = require("../middlewares/Authentication");

MedBoxRouter.use(Authentication);

MedBoxRouter.get("/", MedBoxController.getAll);
MedBoxRouter.get("/:id", MedBoxController.getById);
MedBoxRouter.post("/", MedBoxController.create);
MedBoxRouter.put("/:id", MedBoxController.update);
MedBoxRouter.delete("/:id", MedBoxController.delete);

module.exports = MedBoxRouter;