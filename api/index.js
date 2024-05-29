import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRouter from './routes/User.js';
import authRouter from './routes/Auth.js';
import listingRouter from './routes/Listing.js';
import cookieParser from "cookie-parser";
import path from 'path';
// Load environment variables from .env file
dotenv.config();

// Create Express app
const app = express();

//Allow json in your file
app.use(express.json());


//use Cookie Parser-->
app.use(cookieParser());

// MongoDB connection URI from environment variables
const mongoURI = process.env.MONGO;

// Connect to MongoDB using Mongoose
mongoose.connect(mongoURI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

  const __dirname = path.resolve();




//API Routes-->
app.use('/api/user',userRouter);
app.use('/api/auth',authRouter);
app.use('/api/listing',listingRouter);

app.use(express.static(path.join(__dirname,'/client/dist')));

app.get('*',(req,res)=>{
  res.sendFile(path.join(__dirname,'client','dist','index.html'));
})

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});


// Start the Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

