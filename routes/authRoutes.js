// backend/routes/authRoutes.js
import express from "express";
import { signup, signin } from "../controllers/authController.js";

const router = express.Router();

// POST /api/users/signup
router.post("/signup", signup);

// POST /api/users/signin
router.post("/signin", signin);

export default router;