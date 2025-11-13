import express from "express";
import {
  getAllPackages,
  getPackageById,
  getCurrentPricing,
  createPackage,
  updatePackage,
  deletePackage,
  togglePackageStatus,
  getPackagesByPark,
  getPackageStats,
} from "../Controllers/PackageController.js";
import auth from "../middleware/auth.js";
import admin from "../middleware/admin.js";

const router = express.Router();

// Public routes
router.get("/", getAllPackages);
router.get("/current", getCurrentPricing);
router.get("/park/:park", getPackagesByPark);
router.get("/:id", getPackageById);

// Admin routes
router.post("/", [auth, admin], createPackage);
router.put("/:id", [auth, admin], updatePackage);
router.delete("/:id", [auth, admin], deletePackage);
router.patch("/:id/toggle-status", [auth, admin], togglePackageStatus);
router.get("/stats/overview", [auth, admin], getPackageStats);

export default router;