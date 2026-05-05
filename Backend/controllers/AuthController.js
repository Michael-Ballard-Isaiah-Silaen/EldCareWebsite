const { ObjectId } = require("bson");
const User = require("../models/User");
const { getToken } = require("../helpers/jwt");
const { getHashedString, isStringRelevant } = require("../helpers/bcrypt");
const { CustomError } = require("../middlewares/ErrorHandler");
const MedBox = require("../models/MedBox");

class AuthController {
  static async signIn(req, res, next) {
    try {
      const { email, password, medBoxID, medBoxPassword } = req.body;
      const existingUser = await User.findOne({ email });
      if (!existingUser || !isStringRelevant(password, existingUser.password)) {
        throw new CustomError(403, "Wrong username or password!");
      }
      const existingMedbox = await MedBox.findOne({ MedBoxID: Number(medBoxID) });
      if (!existingMedbox || !isStringRelevant(medBoxPassword, existingMedbox.medBoxPassword)) {
        throw new CustomError(403, "Wrong MedBox ID or password");
      }

      const myJwt = getToken(existingUser);

      res.status(200).json({
        token: getToken(existingUser),
        user: { 
          username: existingUser.username, 
          displayName: existingUser.displayName, 
          role: existingUser.role, 
          _id: existingUser._id,
          medBoxID: existingUser.medBoxID
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async signUp(req, res, next) {
    try {
      const { username, password, displayName, role } = req.body;
      const existedUser = await User.findOne({ username });
      if (existedUser) throw new CustomError(400, "Username is taken");
      const { insertedId } = await User.create({ username, password: getHashedString(password), displayName, role });
      const existingUser = await User.findOne({ _id: new ObjectId(insertedId) });
      res.status(201).json({ token: getToken(existingUser), user: { username, displayName, role, _id: existingUser._id, medBoxID: existingUser.medBoxID } });
    } catch (error) {
      next(error);
    }
  }

  static async userInfo(req, res, next) {
    try {
      res.status(200).json(res.locals.user);
    } catch (error) {
      next(error);
    }
  }
}
module.exports = AuthController;
