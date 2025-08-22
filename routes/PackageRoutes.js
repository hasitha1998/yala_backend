const express = require("express");
const Package = require("../models/Package");
const router = express.Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

// Health check endpoint
router.get("/health", (req, res) => {
  console.log("PackageRoutes: Health check called");
  res.json({ status: "OK", message: "Package routes working" });
});

// Get current pricing
router.get("/current", async (req, res) => {
  try {
    console.log("PackageRoutes: GET /current called");
    const packages = await Package.findOne().sort({ createdAt: -1 });
    console.log("PackageRoutes: Found packages:", packages ? "Yes" : "No");
    if (!packages) {
      console.log("PackageRoutes: No packages found, initializing...");
      await Package.initialize();
      const newPackages = await Package.findOne().sort({ createdAt: -1 });
      console.log(
        "PackageRoutes: Initialized and found:",
        newPackages ? "Yes" : "No"
      );
      return res.json(newPackages);
    }
    console.log("PackageRoutes: Returning existing packages");
    res.json(packages);
  } catch (err) {
    console.error("PackageRoutes: Error in GET /current:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// Update pricing (Admin only)
router.post("/", [auth, admin], async (req, res) => {
  try {
    // Validate the request body
    const { jeep, shared, meals, guide } = req.body;

    if (!jeep || !shared || !meals || !guide) {
      return res.status(400).json({ message: "Invalid package data" });
    }

    // Create new package document
    const newPackage = new Package({
      jeep,
      shared,
      meals,
      guide,
    });

    await newPackage.save();
    res.json(newPackage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// Get pricing history (Admin only)
router.get("/history", [auth, admin], async (req, res) => {
  try {
    const packages = await Package.find().sort({ createdAt: -1 });
    res.json(packages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
