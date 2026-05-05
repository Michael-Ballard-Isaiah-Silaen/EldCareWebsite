// Proto Web/Backend/models/Repo.js
const { ObjectId } = require("mongodb");
const { getDatabase } = require("../config/MongoConnect");

class Repo {
  static async collection() {
    return getDatabase().collection("Repos");
  }

  static async findAll(query = {}) {
    const collection = await Repo.collection();
    return await collection.find(query).toArray();
  }

  static async findById(id) {
    const collection = await Repo.collection();
    return await collection.findOne({ _id: new ObjectId(id) });
  }

  static async findOne(query) {
    const collection = await Repo.collection();
    return await collection.findOne(query);
  }

  static async create(payload) {
    const collection = await Repo.collection();
    if (!payload.documents) payload.documents = [];
    return await collection.insertOne(payload);
  }

  static async updateById(id, updateDoc) {
    const collection = await Repo.collection();
    return await collection.updateOne({ _id: new ObjectId(id) }, { $set: updateDoc });
  }

  static async addDocument(id, document) {
    const collection = await Repo.collection();
    document._id = new ObjectId();
    document.uploadDate = new Date().toISOString();
    
    return await collection.updateOne(
      { _id: new ObjectId(id) },
      { $push: { documents: document } }
    );
  }

  static async removeDocument(id, docId) {
    const collection = await Repo.collection();
    return await collection.updateOne(
      { _id: new ObjectId(id) },
      { $pull: { documents: { _id: new ObjectId(docId) } } }
    );
  }

  static async deleteById(id) {
    const collection = await Repo.collection();
    return await collection.deleteOne({ _id: new ObjectId(id) });
  }
}

module.exports = Repo;