

const mongoose=require('mongoose');

const courseSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        
    },
    media:[
        {
            url: { type: String, required: true },
            format: String,
            fileType: String,
            uploadedAt: { type: Date, default: Date.now }
        }
    ],
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    category:{
        type:String,
    },
    duration:{
        type:String,
    }
})

module.exports=mongoose.model("Course",courseSchema);