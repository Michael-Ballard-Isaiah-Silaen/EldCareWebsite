const multer = require("multer");

const storage = multer.memoryStorage();

const MulterUpload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  }
});

module.exports = MulterUpload;