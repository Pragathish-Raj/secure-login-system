const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
require("dotenv").config()

const path = require("path")

const app = express()

app.use(cors())
app.use(express.json())

// Serve static files (like uploaded profile pics)
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")))

// Root route so visiting the backend URL directly doesn't show an error
app.get("/", (req, res) => {
    res.send("Secure Login API is running!");
})

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err))

app.use("/api/auth", require("./routes/auth"))

const authMiddleware = require("./middleware/authMiddleware")
const User = require("./models/user")

app.get("/api/dashboard", authMiddleware, async (req, res) => {
    try {
        // req.user has the ID from the JWT token
        const user = await User.findById(req.user.id).select("-password")
        if (!user) {
             return res.status(404).json("User not found in dashboard")
        }
        res.json(user)
    } catch(err) {
         res.status(500).json("Server error")
    }
})

app.listen(5000, () => {
    console.log("Server running on port 5000")
})