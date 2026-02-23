const mongoose = require("mongoose");
const {Schema} = mongoose;


const userSchema = Schema({
    name:{
        type:String,
        required:true, 
    },
    age:{
        type:Number,
        required:true,
    },
    contact:{
        type:Number,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    address:{
        type:String,
        required:true,
    },
    profilePicture:{
        type:String,
        default:"../public/images/images.png",
    }
});


const User = mongoose.model("User", userSchema);
module.exports = User;