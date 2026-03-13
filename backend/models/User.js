const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    dob: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    state: {
        type: String,
    },
    mobileNo: {
        type: String,
    },
    password: {
        type: String,
        required: true
    },
    profilePic: {
        type: String,
        default: "" 
    },
    resetOtp: {
        type: String,
    },
    resetOtpExpire: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model("User", UserSchema)