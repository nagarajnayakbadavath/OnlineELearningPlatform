
const express=require('express');
const authRouter=express.Router(); //imp
authRouter.use(express.json());  // to read json 
const bcrypt=require('bcryptjs');
const User=require('../models/user');
const Admin=require('../models/admin');
const jwt=require('jsonwebtoken');
require('dotenv').config();
const jwt_secret_key=process.env.JWT_SECRET_KEY;
const commonAuth=require('../middlewares/Auth');
const Course=require('../models/course');

const cookieParser=require('cookie-parser');
authRouter.use(cookieParser());

authRouter.post("/user/register",async(req,res)=>{
    try{
        const {fullName,emailId,password}=req.body;
        const isUserPresent=await User.findOne({emailId});
        if(isUserPresent){
            return res.status(409).json({success:false,message:"user with this emailId is already present"});
        }
        const hashedPassword=await bcrypt.hash(password,10);
        const user=new User({
            fullName,
            emailId,
            password:hashedPassword
        })
        await user.save();
        res.status(200).json({success:true,message:"registration of user is successfull"});
    }catch(err){
        res.status(404).send(err.message);
    }
});

authRouter.post("/user/login",async(req,res)=>{
    try{
        const {emailId,password}=req.body;
        const newUser=await User.findOne({emailId});
        if(!newUser){
            return res.send("User not found");
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
            role:'user',
            success: true,
            user: newUser,
            token: token,
            message: "Login successful"
        });
        }else{
            res.status(401).send("email or password is invalid");
        }
    }catch(err){
        res.status(404).send(err.message);
    }
});



authRouter.get("/user/getAllCourses",commonAuth,async(req,res)=>{
    try{
        const AllCourses=await Course.find();
        res.send(AllCourses);

    }catch(err){
        res.status(404).send(err.message); 
    }
})







module.exports=authRouter;