import mongoose from 'mongoose';

const userSchema=new mongoose.Schema({
    username:{
        type:String,
        require:true,
        unique:true
    },
    email:{
        type:String,
        require:true,
        unique:true
    },
    password:{
        type:String,
        require:true,
    },
    avatar:{
        type:String,
        default:"https://www.shutterstock.com/image-vector/businessman-avatar-profile-vector-260nw-249652369.jpg",
    },
},{timestamps:true});

const User=mongoose.model('User',userSchema);
export default User;