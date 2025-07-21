const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { cloudinary } = require("./cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "tour-files-cloudinary",
    allowedFormats: ["jpg", "png", "jpeg", "pdf", "mp4"],
  },
});

const parser = multer({ storage });

module.exports = parser;
