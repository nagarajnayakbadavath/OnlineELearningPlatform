const express=require('express');
const bcrypt=require('bcryptjs');
require('dotenv').config();
const nodemailer=require('nodemailer');
const Admin=require('../models/admin');
const adminAuthRouter=express.Router();  // important
const cookieParser=require('cookie-parser');
adminAuthRouter.use(express.json());
adminAuthRouter.use(cookieParser());

const cloudinary=require('../config/cloudinary');
const multer=require('multer');
const Course=require('../models/course');
const Pdf=require('../models/pdf')
const commonAuth=require('../middlewares/Auth');
const jwt_secret_key=process.env.JWT_SECRET_KEY;
const jwt=require('jsonwebtoken');
const admin = require('../models/admin');
const User = require('../models/user');
const PDF= require('../models/pdf');
const course = require('../models/course');
const uploadVideo = require('../middlewares/uploadVideo');
const uploadPDF = require('../middlewares/uploadPDF');



const otpStore={};   //1

//mail configuration  //2

const transporter=nodemailer.createTransport({
    service:'Gmail',
    auth:{
        user:process.env.MAIL_USER,
        pass:process.env.MAIL_PASS,
    }
});

//generate otp function  //3
function generateOTP(){
    return Math.floor(1000+Math.random()*9000).toString();
}

//write the sendotp api
adminAuthRouter.post("/send-otp",async(req,res)=>{
        const {emailId}=req.body;
        const otp=generateOTP();
        otpStore[emailId]={otp,expiresAt:Date.now()+5*60*1000};
    try{
        await transporter.sendMail({
            to:emailId,
            subject:"your otp for verification",
            text:`otp to be entered ${otp}`
        });
        res.send("otp sent successfully");
    }catch(err){
        res.send(err.message);
    }
});

//verify the otp
adminAuthRouter.post("/verify-otp", async (req, res) => {
    const { emailId, otp } = req.body;
    console.log("otpStore:", otpStore);

    const record = otpStore[emailId];

    if (!record) {
        return res.status(400).send("OTP is not sent");
    }

    if (Date.now() > record.expiresAt) {
        return res.status(400).send("OTP is expired");
    }

    if (String(otp) !== String(record.otp)) {
        return res.status(400).send("OTP is not matched");
    }

    otpStore[emailId].verified = true;
    res.status(200).send("OTP verified");
});


adminAuthRouter.post("/admin/register",async(req,res)=>{
    try{
        const {fullName,emailId,password,role}=req.body;
        const hashedPassword=await bcrypt.hash(password,10);
        const admin=new Admin({
            fullName,
            emailId,
            password:hashedPassword,
            role,
        });
        await admin.save();
        res.status(200).send(admin);
    }catch(err){
        res.status(404).send(err.message);
    }
})

adminAuthRouter.post("/:adminId/upload/videos", commonAuth, uploadVideo.single("file"), async (req, res) => {
    try {

    const { title, description } = req.body;
    const file = req.file;
    const adminId = req.params.adminId;

    if (!file) return res.status(400).json({ message: "No file uploaded" });

    console.log("Admin ID:", adminId);

    const newCourse = new Course({
      title,
      description,
      media: [{
        url: file.path,
        format: file.format,
        fileType: file.resource_type || 'video',
      }],
      createdBy: req.admin._id,
    });

    await newCourse.save();
    res.status(201).json({ message: "Course created", course: newCourse });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

adminAuthRouter.post("/:adminId/upload/pdf", commonAuth, uploadPDF.single("file"), async (req, res) => {
  try {
    const { title, description } = req.body;
    const file = req.file;
    const adminId = req.params.adminId;

    if (!file) return res.status(400).json({ message: "No file uploaded" });

    const newPdf = new Pdf({
      title,
      description,
      url: file.path, // Cloudinary secure_url
      uploadedBy: req.admin._id,
      fileType: file.mimetype || "application/pdf",
    });

    await newPdf.save();

    res.status(200).json({ message: "PDF uploaded successfully", pdf: newPdf });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});


adminAuthRouter.post("/admin/login",async(req,res)=>{
    try{
        const {emailId,password,role}=req.body;

        const newUser=await Admin.findOne({emailId});
        if(!newUser){
            return res.send("Admin not found");
        }
        const isValidPassword=await bcrypt.compare(password,newUser.password);
        
        if(isValidPassword){
            const token=jwt.sign({_id:newUser._id},jwt_secret_key);
            // res.cookie("token", token, {
            //     httpOnly: true,
            //     secure: false,           // Set true only when using HTTPS
            //     sameSite: "Lax"
            // });
            res.cookie("token", token, {
                httpOnly: true,
                secure: true,           // Set true only when using HTTPS
                sameSite: "None"
            });
            res.status(200).json({
            role:'admin',
            success: true,
            user: newUser,
            token: token,
            message: "Login successful"
        });
        }else{
            res.send("email or password is incorrect");
        }
    }catch(err){
        res.status(404).send(err.message);
    }
});

adminAuthRouter.post("/admin/logout",async(req,res)=>{
    try{
        res.clearCookie('token',{
            httpOnly:true,
            secure:false,
            sameSite:'lax'
        });
        res.status(200).send("logged out successfully");
    }catch(err){
        res.status(404).send(err.message);
    }
})

adminAuthRouter.get("/getAdmins",async(req,res)=>{
    try{
        const admins=await Admin.find({});
        if(!admins){
            return res.json({message:"admins were not available"});
        }
        res.status(200).json({message:"admins are found",admins});
    }catch(err){
        res.status(401).send(err.message);
    }
});

adminAuthRouter.get("/getUsers",async(req,res)=>{
    try{
        const users=await User.find({});
        if(!users){
            return res.json({message:"users are not found bro"});
        }
        res.status(200).json({message:"users are found",users});
    }catch(err){
        res.status(404).json({message:err.message});
    }
});

adminAuthRouter.get("/getPDF",async(req,res)=>{
    try{
        const getpdf=await PDF.find({});
        if(!getpdf){
            return res.status(401).json({message:"pdf's are not found"});
        }
        res.status(200).json({message:"pdf's are sent",getpdf});
    }catch(err){
        res.status(401).json({message:err.message});
    }
})

adminAuthRouter.delete("/deletePDF/:id",async(req,res)=>{
    try{
        console.log(req.params.id);
        const id=req.params.id;
        const findPdf=await PDF.findById(id);
        if(!findPdf){
            return res.status(401).json({message:"pdf is not found"});
        }
        await PDF.findByIdAndDelete(id);
        res.status(200).json({message:"pdf is removed successfully",findPdf});
    }catch(err){
        res.status(401).json({message:err.message});
    }
})

adminAuthRouter.delete("/deleteCourse/:courseId",async(req,res)=>{
    try{
        const courseId=req.params.courseId;
        const findCourse=await course.findById(courseId);
        if(!findCourse){
            return res.status(401).json({message:"courses are not found"});
        }
        await course.findByIdAndDelete(courseId);
        res.status(200).json({message:"successfully remove the course",findCourse});
    }catch(err){
        res.status(401).json({message:err.message});
    }
});

module.exports=adminAuthRouter;