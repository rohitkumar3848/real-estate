import Listing from "../models/Listing.js";
import User from "../models/User.js";
import { errorHandler } from "../utils/error.js";
import bcryptjs from 'bcryptjs';


export const test=(req,res)=>{
    res.json({
        message:'API route is working',
    });
};


export const updateUser = async (req, res, next) => {
    //console.log("user Update section--->", req.body);
    if (req.user.id !== req.params.id) {
        return next(errorHandler(401, "You can only update your own account"));
    }
    try {
        if (req.body.password) {
            req.body.password = bcryptjs.hashSync(req.body.password, 10);
        }
        
        const updateUser = await User.findByIdAndUpdate(req.params.id, {
            $set: {
                username: req.body.username,
                email: req.body.email,
                password: req.body.password,
                avatar: req.body.avatar
            }
        }, { new: true });

        const { password, ...rest } = updateUser._doc;
        res.status(200).json(rest);
        console.log("user Update Successfully");
    } catch (error) {
        next(error);
    }
};

export const deleteUser = async (req, res, next) => {
    if (req.user.id !== req.params.id) {
        return next(errorHandler(401, "You can only delete your own account"));
    }

    try {
        // Delete the user
        await User.findByIdAndDelete(req.params.id);

        // Delete all listings associated with the user
        await Listing.deleteMany({ userRef: req.params.id });

        // Clear the cookie and send a response
        res.clearCookie('access_token');
        res.status(200).json('User and their listings have been deleted');
    } catch (error) {
        next(error);
    }
};

export const getUserListing=async(req,res,next)=>{
    if (req.user.id !== req.params.id) {
        return next(errorHandler(401, "You can only view your own listings"));
    }
    else{
        try {
            const listings=await Listing.find({userRef:req.params.id});
            res.status(200).json(listings);
         } catch (error) {
             next(error);
         }
    }
};

export const getUser=async(req,res,next)=>{
     try{
        const user=await User.findById(req.params.id);
        if(!user) return next(errorHandler(404,'User not found'));
        const {password:pass,...rest}=user._doc;
        res.status(200).json(rest);
     }
     catch(error){
        next(error);
     }
}