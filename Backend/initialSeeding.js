const User = require("./models/User");
const MedBox = require("./models/MedBox");
const Repo = require("./models/Repo");
const Notification = require("./models/Notification");
const { getHashedString } = require("./helpers/bcrypt");
const { ObjectId } = require("mongodb");

const createIfNotExists = async (Model, query, data) => {
  const existingItem = await Model.findOne(query);
  if (!existingItem) {
    await Model.create(data);
  }
};

const initialSeeding = async () => {
  const repoIdStr = "60d5ec49c12b9a785c9a1234";
  const medBoxIdStr = "507f1f77bcf86cd799439011";

  await createIfNotExists(
    Repo,
    { _id: new ObjectId(repoIdStr) },
    {
      _id: new ObjectId(repoIdStr),
      RepoID: 1,
      documents: []
    }
  );

  await createIfNotExists(
    MedBox,
    { _id: new ObjectId(medBoxIdStr) },
    {
      _id: new ObjectId(medBoxIdStr),
      MedBoxID: 1,
      medBoxPassword: getHashedString("G7!kP2@zR9#vLm4$XqT8"),
      RepoID: repoIdStr, 
    }
  );

  await createIfNotExists(
    User,
    { username: "AndiSuprianto" },
    {
      UserID: 1,
      email: "AndiSuprianto@gmail.com",
      username: "AndiSuprianto",
      password: getHashedString("123"),
      displayName: "Andi Suprianto",
      role: "patient",
      medBoxID: medBoxIdStr, 
    }
  );

  await createIfNotExists(
    User,
    { username: "AmandaAlzena" },
    {
      UserID: 2,
      email: "AmandaAlzena@gmail.com",
      username: "Amanda Alzena",
      password: getHashedString("123"),
      displayName: "Amanda Alzena",
      role: "caretaker",
      medBoxID: medBoxIdStr, 
    }
  );

  await createIfNotExists(
    Notification,
    { NotifID: 1 },
    {
      NotifID: 1,
      MedboxID: medBoxIdStr,
      time: "2026-04-29T18:00:00Z",
      status: true,
      notificationType: "Medicine Taking",
      drugType: "Loratadine"
    }
  );

  await createIfNotExists(
    Notification,
    { NotifID: 2 },
    {
      NotifID: 2,
      MedboxID: medBoxIdStr,
      time: "2026-04-29T08:00:00Z",
      status: false,
      notificationType: "Daily Check In",
      drugType: ""
    }
  );

  await createIfNotExists(
    Notification,
    { NotifID: 3 },
    {
      NotifID: 3,
      MedboxID: medBoxIdStr,
      time: "2026-04-30T08:00:00Z",
      status: false,
      notificationType: "Medicine Taking",
      drugType: "Paracetamol"
    }
  );

  await createIfNotExists(
    Notification,
    { NotifID: 4 },
    {
      NotifID: 4,
      MedboxID: medBoxIdStr,
      time: "2026-04-30T08:30:00Z",
      status: true,
      notificationType: "Daily Check In",
      drugType: ""
    }
  );
};

module.exports = initialSeeding;