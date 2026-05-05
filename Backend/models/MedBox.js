const { ObjectId } = require("mongodb");
const { getDatabase } = require("../config/MongoConnect");

class MedBox {
  static async collection() {
    return getDatabase().collection("MedBoxes");
  }

  static async findAll(query = {}) {
    const collection = await MedBox.collection();
    const result = await collection.find(query).toArray();
    return result;
  }

  static async findOne(query) {
    const collection = await MedBox.collection();
    const result = await collection.findOne(query);
    return result;
  }

  static async findById(id) {
    const collection = await MedBox.collection();
    const result = await collection.findOne({ _id: new ObjectId(id) });
    return result;
  }

  static async create(payload) {
    const collection = await MedBox.collection();
    const result = await collection.insertOne(payload);
    return result;
  }

  static async updateById(id, updateDoc) {
    const collection = await MedBox.collection();
    const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: updateDoc });
    return result;
  }

  static async deleteById(id) {
    const collection = await MedBox.collection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result;
  }
}

module.exports = MedBox;