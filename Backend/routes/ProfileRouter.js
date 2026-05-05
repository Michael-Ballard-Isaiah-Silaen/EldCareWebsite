const ProfileController = require("../controllers/ProfileController");
const Authentication = require("../middlewares/Authentication");

const ProfileRouter = require("express").Router();

ProfileRouter.get("/:username", ProfileController.getByUsername);
ProfileRouter.put("/:_id", Authentication, ProfileController.updateById);

module.exports = ProfileRouter;
