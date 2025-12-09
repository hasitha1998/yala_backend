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
  updateJeepPricing,
  updateGuidePricing,
  addMealOption,
  updateMealOption,
  deleteMealOption,
  bulkUpdatePricing,
  getPackageAvailability, // ✅ ADD THIS IMPORT
} from "../controllers/PackageController.js";
import auth from "../middleware/auth.js";
import admin from "../middleware/admin.js";

const router = express.Router();

// ========================================
// PUBLIC ROUTES (Specific before :id)
// ========================================
router.get("/", getAllPackages);
router.get("/current", getCurrentPricing);
router.get("/park/:park", getPackagesByPark);

// ✅ ADD THIS ROUTE - Must be BEFORE /:id
router.get("/:id/availability", getPackageAvailability);

router.get("/:id", getPackageById);

// ========================================
// ADMIN ROUTES - Package Management
// ========================================
router.post("/", [auth, admin], createPackage);
router.put("/:id", [auth, admin], updatePackage);
router.delete("/:id", [auth, admin], deletePackage);
router.patch("/:id/toggle-status", [auth, admin], togglePackageStatus);
router.get("/stats/overview", [auth, admin], getPackageStats);

// ========================================
// ADMIN ROUTES - Pricing Management
// ========================================
router.put("/:id/jeep-pricing", [auth, admin], updateJeepPricing);
router.put("/:id/guide-pricing", [auth, admin], updateGuidePricing);
router.post("/:id/meal-options", [auth, admin], addMealOption);
router.put("/:id/meal-options/:mealType/:itemIndex", [auth, admin], updateMealOption);
router.delete("/:id/meal-options/:mealType/:itemIndex", [auth, admin], deleteMealOption);
router.put("/:id/pricing-bulk", [auth, admin], bulkUpdatePricing);

export default router;