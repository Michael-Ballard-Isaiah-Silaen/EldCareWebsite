const Repo = require("../models/Repo");
const { CustomError } = require("../middlewares/ErrorHandler");

class RepoController {
  static async getAll(req, res, next) {
    try {
      const repos = await Repo.findAll();
      res.status(200).json(repos);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const repo = await Repo.findById(id);
      if (!repo) throw new CustomError(404, "Repo not found");
      res.status(200).json(repo);
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const result = await Repo.create(req.body);
      res.status(201).json({ message: "Repo created successfully", insertedId: result.insertedId });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const result = await Repo.updateById(id, req.body);
      if (result.matchedCount === 0) throw new CustomError(404, "Repo not found");
      res.status(200).json({ message: "Repo updated successfully" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const result = await Repo.deleteById(id);
      if (result.deletedCount === 0) throw new CustomError(404, "Repo not found");
      res.status(200).json({ message: "Repo deleted successfully" });
    } catch (error) {
      next(error);
    }
  }

  static async uploadDocument(req, res, next) {
    try {
      const { id } = req.params;
      const { name, category, fileBase64 } = req.body;
      if (!fileBase64) {
        throw new CustomError(400, "File is required");
      }
      const document = { name, category, fileUrl: fileBase64 };
      const result = await Repo.addDocument(id, document);
      if (result.matchedCount === 0) throw new CustomError(404, "Repo not found");
      res.status(201).json({ 
        message: "Document uploaded successfully", 
        document: document 
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteDocument(req, res, next) {
    try {
      const { id, docId } = req.params;
      const result = await Repo.removeDocument(id, docId);
      if (result.matchedCount === 0) throw new CustomError(404, "Repo not found");
      res.status(200).json({ message: "Document deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = RepoController;