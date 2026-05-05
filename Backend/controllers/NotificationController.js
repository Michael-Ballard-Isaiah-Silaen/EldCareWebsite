const Notification = require("../models/Notification");
const { CustomError } = require("../middlewares/ErrorHandler");

class NotificationController {
  static async getAll(req, res, next) {
    try {
      const notifications = await Notification.findAll();
      res.status(200).json(notifications);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const notification = await Notification.findById(id);
      if (!notification) throw new CustomError(404, "Notification not found");
      res.status(200).json(notification);
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const result = await Notification.create(req.body);
      res.status(201).json({ message: "Notification created successfully", insertedId: result.insertedId });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const result = await Notification.updateById(id, req.body);
      if (result.matchedCount === 0) throw new CustomError(404, "Notification not found");
      res.status(200).json({ message: "Notification updated successfully" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const result = await Notification.deleteById(id);
      if (result.deletedCount === 0) throw new CustomError(404, "Notification not found");
      res.status(200).json({ message: "Notification deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = NotificationController;