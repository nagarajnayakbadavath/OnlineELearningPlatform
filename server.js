const connectDB=require('./config/db');
const express=require('express');
const dotenv=require('dotenv');

const app=express();

const PORT = process.env.PORT;
app.listen(PORT, () => {
    connectDB();
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});