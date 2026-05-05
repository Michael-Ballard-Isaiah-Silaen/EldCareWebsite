require("dotenv").config();

const express = require("express");
const app = express();
const port = 4000;
const cors = require("cors");
const { MongoConnect } = require("./config/MongoConnect");
const router = require("./routes");
const { errorHandler } = require("./middlewares/ErrorHandler");
const initialSeeding = require("./initialSeeding");

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(router);
app.use(errorHandler);
app.use((req, res) => {
  res.status(404).json("NOT FOUND");
});

(async () => {
  try {
    await MongoConnect();
    await initialSeeding();
    app.listen(port, "0.0.0.0", () => {
      console.log(`Example app listening on port ${port} across all network interfaces`);
    });
  } catch (error) {
    console.error("Failed to start app");
    console.error(error);
  }
})();
