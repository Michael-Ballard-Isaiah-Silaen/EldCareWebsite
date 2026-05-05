const { CustomError } = require("../middlewares/ErrorHandler");
const User = require("../models/User");

class ProfileController {
  static async getByUsername(req, res, next) {
    try {
      const { username } = req.params;
      const user = await User.findOne({ username });
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  static async updateById(req, res, next) {
    try {
      const { _id } = req.params;
      const { profilePicUrl, displayName } = req.body;
      const { _id: UserId } = res.locals.user;
      if (_id !== UserId) {
        throw new CustomError(403, "Unauthorized");
      }
      await User.updateById(_id, { $set: { profilePicUrl, displayName } });
      res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  }
}
module.exports = ProfileController;
