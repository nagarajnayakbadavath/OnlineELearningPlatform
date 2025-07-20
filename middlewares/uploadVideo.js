// middleware/uploadVideo.js
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'Courses',
    resource_type: 'video', // ✅ critical
    public_id: (req, file) => Date.now() + '-' + file.originalname,
  },
});

const uploadVideo = multer({
  storage: videoStorage,
  limits: {
    fileSize: 500 * 1024 * 1024, // ✅ 500MB max
  },
});

module.exports = uploadVideo;
