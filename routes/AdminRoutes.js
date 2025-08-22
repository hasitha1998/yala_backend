const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin"); // Import the Admin model
const Package = require("../models/Package"); // Import Package model for pricing management
const router = express.Router();

// Admin login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the admin exists in the database
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if the password matches
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign({ email: admin.email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error during login:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Admin registration route (for adding new admins)
router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new admin
    const newAdmin = new Admin({
      email,
      password: hashedPassword,
    });

    await newAdmin.save();
    res.status(201).json({ message: "Admin registered successfully" });
  } catch (error) {
    console.error("Error during registration:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update package pricing (Admin only)
router.put("/packages", async (req, res) => {
  try {
    console.log("AdminRoutes: PUT /packages called");
    console.log("AdminRoutes: Request body:", req.body);

    // Validate the request body
    const { jeep, shared, meals, guide } = req.body;

    if (!jeep || !shared || !meals || !guide) {
      console.log("AdminRoutes: Invalid package data");
      return res.status(400).json({ message: "Invalid package data" });
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
    res.json({ message: "Pricing updated successfully", package: newPackage });
  } catch (err) {
    console.error("AdminRoutes: Error updating packages:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
