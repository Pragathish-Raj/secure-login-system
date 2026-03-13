# Secure Login System

A full-stack secure authentication system with OTP-based password reset, JWT session management, profile picture uploads, and a modern glassmorphism UI.

## Features
- **User Registration & Login** (Bcrypt hashed passwords)
- **JWT Authentication** (Secure protected routes)
- **Forgot Password via OTP** (Sent via Gmail using Nodemailer)
- **Profile Picture Uploads** (Multer)
- **Responsive Modern UI** (Vanilla HTML/CSS/JS)

## Tech Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)

## Project Structure
The project is divided into two main folders:
- `/frontend` - Contains all static files (`index.html`, `login.html`, `script.js`, etc.)
- `/backend` - Contains the Express server, Mongoose models, and API routes.

## Local Setup Instructions

### 1. Requirements
- Install **Node.js**: [https://nodejs.org/](https://nodejs.org/)
- Install **MongoDB**: [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community) (Make sure MongoDB is running locally on port `27017` or use a MongoDB Atlas URI)

### 2. Backend Setup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install the necessary Node.js dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file inside the `/backend` folder and add the following variables:
   ```env
   MONGO_URI=mongodb://127.0.0.1:27017/securelogin
   JWT_SECRET=your_super_secret_jwt_key
   
   # For OTP Emails (Use a Gmail App Password, NOT your real password)
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_16_digit_app_password
   ```
4. Start the backend server:
   ```bash
   node server.js
   ```
   *(The server will run on `http://localhost:5000`)*

### 3. Frontend Setup
Because this project uses vanilla HTML/JS for the frontend, you do not need to install anything.

1. Simply open the `frontend/index.html` or `frontend/login.html` file directly in your web browser.
2. The frontend will automatically communicate with the backend running on port `5000`.

## Notes
- Do not commit the `.env` file to version control.
- Ensure the `backend/public/uploads` directory exists if you plan on testing profile picture uploads. 
