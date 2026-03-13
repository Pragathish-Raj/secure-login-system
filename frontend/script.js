const API = "http://localhost:5000/api/auth"

async function register(event) {
    if (event) event.preventDefault();

    // Clear previous errors
    const errorIds = ["firstNameError", "lastNameError", "emailError", "dobError", "stateError", "mobileNoError", "passwordError", "generalError"];
    errorIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerText = "";
    });

    // Get values
    const firstName = document.getElementById("firstName")?.value.trim();
    const lastName = document.getElementById("lastName")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const dob = document.getElementById("dob")?.value;
    const state = document.getElementById("state")?.value;
    const mobileNo = document.getElementById("mobileNo")?.value.trim();
    const password = document.getElementById("password")?.value;

    let isValid = true;

    // Validation
    if (!firstName) { document.getElementById("firstNameError").innerText = "First name is required"; isValid = false; }
    if (!lastName) { document.getElementById("lastNameError").innerText = "Last name is required"; isValid = false; }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) { 
        document.getElementById("emailError").innerText = "Email is required"; isValid = false; 
    } else if (!emailRegex.test(email)) {
        document.getElementById("emailError").innerText = "Please enter a valid email"; isValid = false;
    }

    if (!dob) { document.getElementById("dobError").innerText = "Date of Birth is required"; isValid = false; }
    if (!state) { document.getElementById("stateError").innerText = "Please select a state"; isValid = false; }
    
    if (!mobileNo) { 
        document.getElementById("mobileNoError").innerText = "Mobile number is required"; isValid = false; 
    } else if (mobileNo.length < 10) {
        document.getElementById("mobileNoError").innerText = "Mobile number is invalid"; isValid = false;
    }

    if (!password) { 
        document.getElementById("passwordError").innerText = "Password is required"; isValid = false; 
    } else if (password.length < 6) {
        document.getElementById("passwordError").innerText = "Password must be at least 6 characters"; isValid = false;
    }

    if (!isValid) return;

    try {
        const res = await fetch(API + "/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ firstName, lastName, email, dob, state, mobileNo, password })
        });

        if (res.ok) {
            alert("Registered Successfully! Redirecting to login...");
            window.location.href = "login.html";
        } else {
            const errorData = await res.json();
            document.getElementById("generalError").innerText = errorData.message || typeof errorData === 'string' ? errorData : "Registration failed";
        }
    } catch (error) {
        document.getElementById("generalError").innerText = "Server error. Please try again later.";
    }
}

async function login(event) {
    if (event) event.preventDefault();

    // Clear previous errors
    const errorIds = ["emailError", "passwordError", "generalError"];
    errorIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerText = "";
    });

    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value;

    let isValid = true;

    if (!email) { document.getElementById("emailError").innerText = "Email is required"; isValid = false; }
    if (!password) { document.getElementById("passwordError").innerText = "Password is required"; isValid = false; }

    if (!isValid) return;

    try {
        const res = await fetch(API + "/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem("token", data.token);
            alert("Login Success! Redirecting to dashboard...");
            window.location.href = "dashboard.html";
        } else {
            document.getElementById("generalError").innerText = data || data.message || "Invalid credentials";
        }
    } catch (error) {
        document.getElementById("generalError").innerText = "Server error. Please try again later.";
    }
}

async function loadDashboard() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("You are not logged in!");
        window.location.href = "login.html";
        return;
    }

    try {
        const res = await fetch("http://localhost:5000/api/dashboard", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (res.ok) {
            const data = await res.json();
            // Format what to show securely based on backend response
            document.getElementById("data").innerHTML = `
                <div style="text-align: left; background: rgba(0,0,0,0.2); padding: 15px; border-radius: 8px;">
                    <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
                    <p><strong>Email:</strong> ${data.email}</p>
                    <p><strong>State:</strong> ${data.state}</p>
                    <p><strong>Mobile:</strong> ${data.mobileNo}</p>
                </div>
            `;
        } else {
            document.getElementById("data").innerText = "Session expired or invalid token.";
            localStorage.removeItem("token");
            window.location.href = "login.html";
        }
    } catch (error) {
        document.getElementById("data").innerText = "Error loading dashboard data.";
    }
}

async function sendOtp(event) {
    if (event) event.preventDefault();

    const email = document.getElementById("resetEmail")?.value.trim();
    if (!email) {
        document.getElementById("resetEmailError").innerText = "Email is required";
        return;
    }
    
    document.getElementById("resetEmailError").innerText = "";
    document.getElementById("otpGeneralError").innerText = "";
    document.getElementById("otpSuccessMessage").innerText = "Sending...";

    try {
        const res = await fetch(API + "/forgot-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email })
        });

        const data = await res.json();

        if (res.ok) {
            document.getElementById("otpSuccessMessage").innerText = "OTP sent to your email!";
            // Make email readonly and show Step 2
            document.getElementById("resetEmail").readOnly = true;
            document.getElementById("sendOtpBtn").style.display = "none";
            
            document.getElementById("verifyOtpForm").style.display = "block";
            document.getElementById("form-subtitle").innerText = "Enter the OTP sent to your email";
        } else {
            document.getElementById("otpSuccessMessage").innerText = "";
            document.getElementById("otpGeneralError").innerText = data || "Failed to send OTP";
        }
    } catch (error) {
        document.getElementById("otpSuccessMessage").innerText = "";
        document.getElementById("otpGeneralError").innerText = "Server error. Please try again later.";
    }
}

async function resetPassword(event) {
    if (event) event.preventDefault();

    const email = document.getElementById("resetEmail")?.value.trim();
    const otp = document.getElementById("otpCode")?.value.trim();
    const newPassword = document.getElementById("newPassword")?.value;

    let isValid = true;
    
    document.getElementById("otpError").innerText = "";
    document.getElementById("newPasswordError").innerText = "";
    document.getElementById("resetGeneralError").innerText = "";

    if (!otp) { document.getElementById("otpError").innerText = "OTP is required"; isValid = false; }
    if (!newPassword) { 
        document.getElementById("newPasswordError").innerText = "New password is required"; isValid = false; 
    } else if (newPassword.length < 6) {
        document.getElementById("newPasswordError").innerText = "Password must be at least 6 characters"; isValid = false;
    }

    if (!isValid) return;

    try {
        const res = await fetch(API + "/reset-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, otp, newPassword })
        });

        let data;
        try {
            data = await res.json();
        } catch(e) {
            data = "Success";
        }

        if (res.ok) {
            document.getElementById("resetSuccessMessage").innerText = "Password reset successfully! Redirecting...";
            setTimeout(() => {
                window.location.href = "login.html";
            }, 2000);
        } else {
            document.getElementById("resetGeneralError").innerText = data || "Invalid OTP or error";
        }
    } catch (error) {
        document.getElementById("resetGeneralError").innerText = "Server error. Please try again later.";
    }
}