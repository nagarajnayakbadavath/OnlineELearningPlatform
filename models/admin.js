const mongoose=require('mongoose');


const AdminSchema=new mongoose.Schema({
    fullName:{
        type:String,
        required:true,
    },
    emailId:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        enum:['admin','user'],
        required:true,
    },
},{timestamps:true});

module.exports=mongoose.model("Admin",AdminSchema);