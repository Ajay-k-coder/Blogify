const mongoose = require("mongoose");
const { Schema } = mongoose;

const userOTP = Schema({
    email: {
        type: String,
        require: true,
    },
    otp: {
        type: Number,
    },
    createAt: {
        type: Date,
        default: Date.now(),
        expires: 3000,
    },
});

const OTP = mongoose.model("OTP", userOTP);

module.exports = OTP;
