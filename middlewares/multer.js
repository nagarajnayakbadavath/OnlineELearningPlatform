
const multer=require('multer');
const {CloudinaryStorage}=require('multer-storage-cloudinary');
const cloudinary=require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "Courses",
    resource_type: "auto", // ✅ VERY IMPORTANT
    public_id: (req, file) => file.originalname.split(".")[0], // optional
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 200 * 1024 * 1024, // ✅ 200MB
  },
});


module.exports=upload;