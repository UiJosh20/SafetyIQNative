const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./CloudinaryConfig");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "safetyIQ",
    format: async (req, file) => "png",
    public_id: (req, file) => file.originalname,
  },
});

const parser = multer({ storage: storage });

module.exports = parser;
