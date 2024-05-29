import User from "../models/User.js";
import bcryptjs from 'bcryptjs';
import { errorHandler } from "../utils/error.js";
import jwt from 'jsonwebtoken';

export const signup = async (req, res,next) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = bcryptjs.hashSync(password, 10);

    const newUser = new User({ username, email, password: hashedPassword });
    console.log(password, "-->", hashedPassword);

    await newUser.save();
    res.status(201).json("User Created Successfully");
  } catch (error) {
    next(error);
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;
  console.log("Inside siginin page--->")
  
  try {
    // Find user by email
    const validUser = await User.findOne({ email });

    // Check if user exists
    if (!validUser) {
      return next(errorHandler(404,'User not found!' ));
    }

    // Compare passwords
    const validPassword = bcryptjs.compareSync(password, validUser.password);

    // Check if password is valid
    if (!validPassword) {
      return next(errorHandler(401,'Wrong Credentials !' ));
    }

    // Generate JWT token
    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET);

    const {password:pass,...rest}=validUser._doc;
    // // Set token in cookie and send user data in response
    // console.log("Signin Sucess fully")
    res.cookie('access_token', token, { httpOnly: true }).status(200).json(rest);
  } catch (error) {
    // Pass error to error-handling middleware
    next(error);
  }
};

export const google = async (req, res, next) => {
  //console.log("Google run--->",req.body);
   console.log(req.body);
  try {
    // Check if user already exists with the provided email
    const user = await User.findOne({ email: req.body.email });
    //console.log("Google Inside run--->",req.body);
    if (user) {
      // User exists, generate token and respond with user data
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      const { password: pass, ...rest } = user._doc;
      res.cookie('access_token', token, {
        httpOnly: true,
        secure:false,
      })
      .status(200)
      .json(rest);      
    } else {
      // User does not exist, create a new user
      const generatePassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatePassword, 10);

      // Generate a unique username based on name and random characters
      const username = req.body.name.split(" ").join("").toLowerCase() + Math.random().toString(36).slice(-4);

      // Create new User instance
      const newUser = new User({
        username: username,
        email: req.body.email,
        password: hashedPassword,
        avatar: req.body.photo // Assuming 'avatar' field is correct
      });

      // Save the new user to the database
      await newUser.save();

      // Generate token for the new user and respond with user data
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
      const { password: pass, ...rest } = newUser._doc;
      res
        .cookie('access_token', token, { httpOnly: true })
        .status(200)
        .json(rest);
    }
  } catch (error) {
    // Pass any errors to the error handling middleware
    next(error);
  }
};


export const signout=async(req,res,next)=>{
  try{
    res.clearCookie('access_token');
    res.status(200).json('User has been logged out!');
  }
  catch(error){
    next(error);
  }
}

