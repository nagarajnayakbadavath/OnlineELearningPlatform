const mongoose=require('mongoose');
const dotenv=require('dotenv');

dotenv.config(); // Loads .env variables

const connectDB=async()=>{
    try{
        mongoose.connect(process.env.MONGODB_URL);
        console.log('mongodb is connected');
    }catch(err){
        console.log(err.message);
    }
}

module.exports=connectDB;