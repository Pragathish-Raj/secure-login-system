const router = require("express").Router()
const User = require("../models/user")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const multer = require("multer")
const path = require("path")
const nodemailer = require("nodemailer")

// Configure multer storage
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "public/uploads/")
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({ storage: storage })

// REGISTER

router.post("/register", async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(req.body.password, salt)

        const newUser = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            dob: req.body.dob,
            email: req.body.email,
            state: req.body.state,
            mobileNo: req.body.mobileNo,
            password: hashedPassword,
        })

        await newUser.save()
        res.json("User Registered Successfully")
    } catch (err) {
        console.error(err)
        if (err.code === 11000) {
            return res.status(400).json({ message: "An account with this email already exists" })
        }
        res.status(500).json({ message: "Internal server error during registration" })
    }
})

// UPLOAD PROFILE PHOTO
router.post("/upload", upload.single("profilePic"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json("No file uploaded")
        }
        
        // Since we are applying this route without authMiddleware first (can be improved), 
        // we'll expect the email or user ID to find the user to update
        if(req.body.email) {
             const user = await User.findOneAndUpdate(
                 { email: req.body.email }, 
                 { profilePic: "/uploads/" + req.file.filename },
                 { new: true }
             )
             if(!user) return res.status(404).json("User not found to attach photo")
        }

        res.json({ 
            message: "File uploaded successfully", 
            filePath: "/uploads/" + req.file.filename 
        })
    } catch (err) {
        console.error(err)
        res.status(500).json(err)
    }
})



// LOGIN

router.post("/login", async (req, res) => {

    try {

        const user = await User.findOne({ email: req.body.email })

        if (!user) {
            return res.status(404).json("User not found")
        }

        const validPassword = await bcrypt.compare(
            req.body.password,
            user.password
        )

        if (!validPassword) {
            return res.status(400).json("Invalid Password")
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        )

        res.json({ token })

    } catch (err) {
        res.status(500).json(err)
    }

})

// FORGOT PASSWORD
router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body
        const user = await User.findOne({ email })
        if (!user) return res.status(404).json("User with this email does not exist")

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        
        // Save OTP and expiration (10 mins)
        user.resetOtp = otp
        user.resetOtpExpire = Date.now() + 10 * 60 * 1000
        await user.save()

        // Send Email
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        })

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Password Reset OTP",
            text: `Your password reset OTP is ${otp}. It will expire in 10 minutes.`
        }

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error)
                return res.status(500).json("Error sending email. Check Gmail credentials.")
            } else {
                return res.json("OTP sent to your email")
            }
        })
    } catch (err) {
        console.error(err)
        res.status(500).json("Server error")
    }
})

// RESET PASSWORD
router.post("/reset-password", async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body
        
        const user = await User.findOne({ 
            email, 
            resetOtp: otp, 
            resetOtpExpire: { $gt: Date.now() } 
        })

        if (!user) return res.status(400).json("Invalid or expired OTP")

        // Hash new password
        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(newPassword, salt)
        
        // Clear OTP fields
        user.resetOtp = undefined
        user.resetOtpExpire = undefined
        
        await user.save()
        res.json("Password reset successful")
    } catch (err) {
        console.error(err)
        res.status(500).json("Server error")
    }
})

module.exports = router