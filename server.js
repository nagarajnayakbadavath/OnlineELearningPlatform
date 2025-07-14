const express=require('express');
require('dotenv').config();
const connectDB=require('./config/db');
const cors=require('cors');
const app=express();
const cookieParser = require("cookie-parser");


const PORT = process.env.PORT;
// app.use(express.json());
app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ extended: true,limit: "200mb"  }));
app.use(cookieParser());

const authRouter=require('./routers/auth');
const adminAuthRouter=require('./routers/adminAuth');



app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out' });
});

app.use("/",authRouter);
app.use("/",adminAuthRouter);

app.listen(PORT, () => {
    connectDB();
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});