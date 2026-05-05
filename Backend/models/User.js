const { ObjectId } = require("mongodb");
const { getDatabase } = require("../config/MongoConnect");

class User {
  static async collection() {
    return getDatabase().collection("Users");
  }

  static async findAll(query = {}) {
    const collection = await User.collection();
    const result = await collection.find(query).toArray();
    return result;
  }

  static async findOne(query) {
    const collection = await User.collection();
    const myData = await collection.findOne(query);
    return myData;
  }

  static async create(payload) {
    const collection = await User.collection();
    const result = await collection.insertOne(payload);
    return result;
  }

  static async updateById(id, updateDoc) {
    const collection = await User.collection();
    const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: updateDoc });
    return result;
  }

  static async deleteById(id) {
    const collection = await User.collection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result;
  }
}

module.exports = User;