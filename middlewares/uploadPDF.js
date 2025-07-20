// middleware/uploadPDF.js
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const pdfStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'PDFs',
    resource_type: 'auto',
    public_id: (req, file) => Date.now() + '-' + file.originalname,
  },
});

const uploadPDF = multer({
  storage: pdfStorage,
  limits: {
    fileSize: 100 * 1024 * 1024, // ✅ 100MB
  },
});

module.exports = uploadPDF;
