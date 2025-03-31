const multer = require("multer");
const path = require("path");

// Multer config for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== ".pdf" && ext !== ".docx") {
      return cb(new Error("Only .pdf and .docx files are allowed"), false);
    }
    cb(null, true);
  },
});

module.exports = upload;
