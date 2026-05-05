const AuthController = require("../controllers/AuthController");
const Authentication = require("../middlewares/Authentication");

const AuthRouter = require("express").Router();

AuthRouter.get("/user-info", Authentication, AuthController.userInfo);
AuthRouter.post("/sign-in", AuthController.signIn);
AuthRouter.post("/sign-up", AuthController.signUp);

module.exports = AuthRouter;
