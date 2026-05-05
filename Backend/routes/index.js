const AuthRouter = require("./AuthRouter");
const MedBoxRouter = require("./MedBoxRouter");
const NotificationRouter = require("./NotificationRouter");
const RepoRouter = require("./RepoRouter");
const ScheduleRouter = require("./ScheduleRouter");
const router = require("express").Router();

router.get("/", (req, res) => {
  res.send(":3");
});

router.use("/auth", AuthRouter);
router.use("/medbox", MedBoxRouter);
router.use("/notifications", NotificationRouter);
router.use("/medicalrecords", RepoRouter);
router.use("/schedules", ScheduleRouter);

module.exports = router;
