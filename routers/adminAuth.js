const express=require('express');
const bcrypt=require('bcryptjs');
require('dotenv').config();
const nodemailer=require('nodemailer');
const Admin=require('../models/admin');
const adminAuthRouter=express.Router();  // important
const cookieParser=require('cookie-parser');
adminAuthRouter.use(express.json());
adminAuthRouter.use(cookieParser());

const upload=require('../middlewares/multer');
const cloudinary=require('../config/cloudinary');
const multer=require('multer');
const Course=require('../models/course');

const commonAuth=require('../middlewares/Auth');
const jwt_secret_key=process.env.JWT_SECRET_KEY;
const jwt=require('jsonwebtoken');



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

adminAuthRouter.post("/:adminId/upload/videos",commonAuth,upload.single("file"),async(req,res)=>{
    
    try{
        const {title,description}=req.body;
        const file=req.file;


        if(!file) return res.send("No file is Uploaded");
        
        const newCourse=new Course({
            title,
            description,
            media: [{
                url: file.path, // Cloudinary secure URL
                format: file.format,
                fileType: file.resource_type || 'auto'
            }],
            createdBy: req.admin._id,
        });
        await newCourse.save();
        res.json({message:"course created",course:newCourse});
    }catch(err){
        res.status(404).send(err.message);
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
            res.cookie("token", token, {
                httpOnly: true,
                secure: false,           // Set true only when using HTTPS
                sameSite: "Lax"
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


module.exports=adminAuthRouter;