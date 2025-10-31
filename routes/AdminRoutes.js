import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import Package from "../models/Package.js";
import auth from "../middleware/auth.js";
import admin from "../middleware/admin.js";

const router = express.Router();

// ==========================================
// ADMIN LOGIN - GENERATES JWT TOKEN
// ==========================================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Email and password are required" 
      });
    }

    // Check if the admin exists in the database
    const admin = await Admin.findOne({ email });
    
    if (!admin) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid email or password" 
      });
    }

    // Check if the password matches
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid email or password" 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        email: admin.email, 
        isAdmin: true,
        _id: admin._id 
      },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "24h" } // Token expires in 24 hours
    );

    // Send success response with token
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      admin: {
        email: admin.email,
        _id: admin._id
      },
      expiresIn: "24h"
    });

  } catch (error) {
    console.error("Error during login:", error.message);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
});

// ==========================================
// VERIFY TOKEN - Check if token is valid
// ==========================================
router.get("/verify-token", auth, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Token is valid",
    user: {
      email: req.user.email,
      isAdmin: req.user.isAdmin,
      _id: req.user._id
    }
  });
});

// ==========================================
// GET CURRENT ADMIN INFO
// ==========================================
router.get("/me", auth, async (req, res) => {
  try {
    const admin = await Admin.findById(req.user._id).select("-password");
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }

    res.status(200).json({
      success: true,
      admin: {
        _id: admin._id,
        email: admin.email
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// ==========================================
// ADMIN REGISTRATION - Create new admin
// ==========================================
router.post("/register", [auth, admin], async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Email and password are required" 
      });
    }

    // Check if the admin already exists
    const existingAdmin = await Admin.findOne({ email });
    
    if (existingAdmin) {
      return res.status(400).json({ 
        success: false,
        message: "Admin already exists" 
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new admin
    const newAdmin = new Admin({
      email,
      password: hashedPassword,
    });

    await newAdmin.save();

    // Generate token for new admin
    const token = jwt.sign(
      { 
        email: newAdmin.email, 
        isAdmin: true,
        _id: newAdmin._id 
      },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "24h" }
    );

    res.status(201).json({ 
      success: true,
      message: "Admin registered successfully",
      token,
      admin: {
        email: newAdmin.email,
        _id: newAdmin._id
      }
    });

  } catch (error) {
    console.error("Error during registration:", error.message);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
});

// ==========================================
// CHANGE PASSWORD
// ==========================================
router.post("/change-password", auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required"
      });
    }

    // Get admin
    const admin = await Admin.findById(req.user._id);
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }

    // Check current password
    const isPasswordValid = await bcrypt.compare(currentPassword, admin.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    admin.password = hashedPassword;
    await admin.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully"
    });

  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// ==========================================
// UPDATE PACKAGE PRICING (Admin only)
// ==========================================
router.put("/packages", [auth, admin], async (req, res) => {
  try {
    console.log("AdminRoutes: PUT /packages called");
    console.log("AdminRoutes: Request body:", req.body);

    // Validate the request body
    const { jeep, shared, meals, guide } = req.body;
    
    if (!jeep || !shared || !meals || !guide) {
      console.log("AdminRoutes: Invalid package data");
      return res.status(400).json({ 
        success: false,
        message: "Invalid package data" 
      });
    }

    // Create new package document with updated pricing
    const newPackage = new Package({
      jeep,
      shared,
      meals,
      guide,
    });

    console.log("AdminRoutes: Saving new package...");
    await newPackage.save();
    console.log("AdminRoutes: Package saved successfully");

    res.json({ 
      success: true,
      message: "Pricing updated successfully", 
      package: newPackage 
    });

  } catch (err) {
    console.error("AdminRoutes: Error updating packages:", err);
    res.status(500).json({ 
      success: false,
      message: "Server Error" 
    });
  }
});

// ==========================================
// GET ALL ADMINS (Super Admin only)
// ==========================================
router.get("/admins", [auth, admin], async (req, res) => {
  try {
    const admins = await Admin.find().select("-password");
    
    res.status(200).json({
      success: true,
      count: admins.length,
      admins
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

export default router;