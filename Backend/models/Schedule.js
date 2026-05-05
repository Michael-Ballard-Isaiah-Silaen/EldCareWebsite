const { ObjectId } = require("mongodb");
const { getDatabase } = require("../config/MongoConnect");

class Schedule {
  static async collection() {
    return getDatabase().collection("Schedules");
  }

  static async findAll(query = {}) {
    const collection = await Schedule.collection();
    const result = await collection.find(query).toArray();
    return result;
  }

  static async findOne(query) {
    const collection = await Schedule.collection();
    const result = await collection.findOne(query);
    return result;
  }

  static async findById(id) {
    const collection = await Schedule.collection();
    const result = await collection.findOne({ _id: new ObjectId(id) });
    return result;
  }

  static async create({ ScheduleID, MedBoxID, medicationName, consumptionTime, consumptionDate, dosage, color, confirmation = false, confirmationMedBox = false, medBoxSlot = null }) {
    const collection = await Schedule.collection();
    const result = await collection.insertOne({ ScheduleID, MedBoxID, medicationName, consumptionTime, consumptionDate, dosage, color, confirmation, confirmationMedBox, medBoxSlot });
    return result;
  }

  static async createMany(schedules) {
    const collection = await Schedule.collection();
    const result = await collection.insertMany(schedules);
    return result;
  }

  static async updateById(id, updateDoc) {
    const collection = await Schedule.collection();
    const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: updateDoc });
    return result;
  }

  static async deleteById(id) {
    const collection = await Schedule.collection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result;
  }
}

module.exports = Schedule;