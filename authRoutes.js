const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const router = express.Router();
const twilio = require("twilio");
require("dotenv").config();

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

// ✅ Step 1: Signup (send OTP)
router.post("/signup", async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) return res.status(400).json({ error: "User already exists" });

    console.log("📩 Sending OTP to", phone);

    // ✅ Send OTP using Twilio Verify
    const verification = await client.verify.v2
      .services(process.env.TWILIO_SERVICE_ID)
      .verifications.create({ to: `+91${phone}`, channel: "sms" });

    console.log("✅ OTP sent successfully", verification.sid);

    const otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
    const user = new User({ name, email, phone, password, role, otpExpires });
    await user.save();

    res.json({ success: true, message: "OTP sent successfully", userId: user._id });
  } catch (err) {
    console.error("❌ Signup error details:", err.message);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// ✅ Forgot Password - Send OTP
router.post("/forgot-password", async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: "Phone number required" });

  try {
    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ error: "User not found" });

    await client.verify.v2
      .services(process.env.TWILIO_SERVICE_ID)
      .verifications.create({ to: `+91${phone}`, channel: "sms" });

    res.json({ success: true, message: "OTP sent for password reset" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

// ✅ Verify OTP + Reset Password
router.post("/reset-password", async (req, res) => {
  const { phone, otp, newPassword } = req.body;
  if (!phone || !otp || !newPassword)
    return res.status(400).json({ error: "Missing fields" });

  try {
    const verification = await client.verify.v2
      .services(process.env.TWILIO_SERVICE_ID)
      .verificationChecks.create({ to: `+91${phone}`, code: otp });

    if (verification.status !== "approved") {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate({ phone }, { password: hashedPassword });

    res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Server error" });
  }
});


router.post("/verify-otp", async (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ success: false, error: "Missing parameters" });
  }

  try {
    const verificationCheck = await client.verify.v2
      .services(process.env.TWILIO_SERVICE_ID)
      .verificationChecks.create({ to: `+91${phone}`, code: otp });

    if (verificationCheck.status === "approved") {
      // Mark user as verified
      await User.findOneAndUpdate({ phone }, { isVerified: true });

      return res.json({ success: true, message: "Phone verified successfully" });
    } else {
      return res.status(400).json({ success: false, error: "Invalid OTP" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: "OTP verification failed" });
  }
});


// ✅ Step 3: Login
router.post("/login", async (req, res) => {
  try {
    const { phone, password } = req.body;

    const user = await User.findOne({ phone });
    if (!user) return res.status(400).json({ error: "User not found" });
    if (!user.isVerified) return res.status(403).json({ error: "Please verify your phone number" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "30d" });
    res.json({ success: true, token, user });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
