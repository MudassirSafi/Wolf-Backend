// backend/controllers/authController.js
import User from "../models/User.js";  // ← ONLY THIS LINE
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


const JWT_SECRET = process.env.JWT_SECRET || "MuhibAfridi2WolfSecretKey";
const createToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

export const signup = async (req, res) => {
  try {
    console.log("Signup attempt:", req.body);
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password: hashed,
      role: normalizedEmail.includes("admin") ? "admin" : "user",
    });

    await user.save();
    const token = createToken(user);

    res.status(201).json({
      token,
      role: user.role,
      message: "Account created successfully",
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const signin = async (req, res) => {
  try {
    console.log("Signin attempt:", req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = createToken(user);

    res.json({
      token,
      role: user.role,
      message: "Signed in successfully",
    });
  } catch (err) {
    console.error("Signin error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};