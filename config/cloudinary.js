
const multer=require('multer');
const cloudinaryStorage=require('multer-storage-cloudinary');
const cloudinary=require('cloudinary').v2;
require('dotenv').config();


cloudinary.config({
    cloud_name:"dof28fswd",
    api_key:process.env.API_KEY,
    api_secret:process.env.API_SECRET,
});

module.exports=cloudinary;