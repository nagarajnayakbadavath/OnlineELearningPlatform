const mongoose=require('mongoose');

const UserSchema=new mongoose.Schema({
    fullName:{
        type:String,
        required:true,
        min:[6],
        max:[12],
    },
    emailId:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    phone:{
        type:String,
    },
    profilePic:{
        type:String,
    },
    gender:{
        type:String,
    },
    role:{
        type:String,
        enum:['user','admin'],
        default:'user',
    },
},{timestamps:true});

module.exports=mongoose.model("User",UserSchema);