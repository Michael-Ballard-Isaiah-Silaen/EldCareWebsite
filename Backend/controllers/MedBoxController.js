const MedBox = require("../models/MedBox");
const { CustomError } = require("../middlewares/ErrorHandler");

class MedBoxController {
  static async getAll(req, res, next) {
    try {
      const medboxes = await MedBox.findAll();
      res.status(200).json(medboxes);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const medbox = await MedBox.findById(id);
      if (!medbox) throw new CustomError(404, "MedBox not found");
      res.status(200).json(medbox);
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const result = await MedBox.create(req.body);
      res.status(201).json({ message: "MedBox created successfully", insertedId: result.insertedId });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const result = await MedBox.updateById(id, req.body);
      if (result.matchedCount === 0) throw new CustomError(404, "MedBox not found");
      res.status(200).json({ message: "MedBox updated successfully" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const result = await MedBox.deleteById(id);
      if (result.deletedCount === 0) throw new CustomError(404, "MedBox not found");
      res.status(200).json({ message: "MedBox deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = MedBoxController;