const Schedule = require("../models/Schedule");
const { CustomError } = require("../middlewares/ErrorHandler");

class ScheduleController {
  static async getAll(req, res, next) {
    try {
      const schedules = await Schedule.findAll();
      res.status(200).json(schedules);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const schedule = await Schedule.findById(id);
      if (!schedule) throw new CustomError(404, "Schedule not found");
      res.status(200).json(schedule);
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const result = await Schedule.create(req.body);
      res.status(201).json({ message: "Schedule created successfully", insertedId: result.insertedId });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const result = await Schedule.updateById(id, req.body);
      if (result.matchedCount === 0) throw new CustomError(404, "Schedule not found");
      res.status(200).json({ message: "Schedule updated successfully" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const result = await Schedule.deleteById(id);
      if (result.deletedCount === 0) throw new CustomError(404, "Schedule not found");
      res.status(200).json({ message: "Schedule deleted successfully" });
    } catch (error) {
      next(error);
    }
  }

  static async createRoutine(req, res, next) {
    try {
      const { medicationName, dosage, startDate, consumptionTimes, takenEvery, color } = req.body;
      const [yearStr, monthStr, dayStr] = startDate.split('-');
      const year = parseInt(yearStr, 10);
      const monthIndex = parseInt(monthStr, 10) - 1; 
      const startDay = parseInt(dayStr, 10);
      let currentDate = new Date(year, monthIndex, startDay);
      const endOfMonth = new Date(year, monthIndex + 1, 0); 
      const schedulesToInsert = [];
      while (currentDate <= endOfMonth) {
        const currentYear = currentDate.getFullYear();
        const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
        const currentDay = String(currentDate.getDate()).padStart(2, '0');
        const formattedDate = `${currentYear}-${currentMonth}-${currentDay}`;
        for (const time of consumptionTimes) {
          schedulesToInsert.push({
            ScheduleID: `SCH-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
            MedBoxID: null,
            medicationName,
            dosage,
            consumptionDate: formattedDate,
            consumptionTime: time,
            color,
            confirmation: false,
            confirmationMedBox: false,
            medBoxSlot: null
          });
        }
        currentDate.setDate(currentDate.getDate() + parseInt(takenEvery));
      }
      const result = await Schedule.createMany(schedulesToInsert);
      res.status(201).json({ message: "Routine schedules created successfully", insertedCount: result.insertedCount });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ScheduleController;