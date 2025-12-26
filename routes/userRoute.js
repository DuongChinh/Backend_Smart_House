// routes/userRoute.js
import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  createAdmin,
} from "../controllers/userController.js";
import { isAuthenticated, isAdmin } from "../middlewares/auth.js";
import { User } from "../models/UserSchema.js";

const router = express.Router();

// Public
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected
router.post("/logout", isAuthenticated, logoutUser);
router.get("/profile", isAuthenticated, getUserProfile);

// Admin only
router.post("/admin/create", isAuthenticated, isAdmin, createAdmin);
router.get("/users", isAuthenticated, isAdmin, async (req, res) => {
  const users = await User.find().select("-password");
  res.json({ success: true, users });
});

export default router;
