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
  // 🆕 New pricing management endpoints
  updateJeepPricing,
  updateGuidePricing,
  addMealOption,
  updateMealOption,
  deleteMealOption,
  bulkUpdatePricing,
} from "../Controllers/PackageController.js";
import auth from "../middleware/auth.js";
import admin from "../middleware/admin.js";

const router = express.Router();

// ========================================
// PUBLIC ROUTES
// ========================================
router.get("/", getAllPackages);
router.get("/current", getCurrentPricing);
router.get("/park/:park", getPackagesByPark);
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
// 🆕 ADMIN ROUTES - Pricing Management
// ========================================

// Jeep Pricing Management
// PUT /api/packages/:id/jeep-pricing
// Body: { jeepType: "luxury", timeSlot: "morning", price: 65 }
router.put("/:id/jeep-pricing", [auth, admin], updateJeepPricing);

// Guide Pricing Management
// PUT /api/packages/:id/guide-pricing
// Body: { guideType: "driverGuide", price: 15 }
router.put("/:id/guide-pricing", [auth, admin], updateGuidePricing);

// Meal Options Management
// POST /api/packages/:id/meal-options
// Body: { mealType: "breakfast", name: "Pancakes", price: 3, isVegetarian: true }
router.post("/:id/meal-options", [auth, admin], addMealOption);

// PUT /api/packages/:id/meal-options/:mealType/:itemIndex
// Body: { name: "Updated name", price: 4 }
router.put("/:id/meal-options/:mealType/:itemIndex", [auth, admin], updateMealOption);

// DELETE /api/packages/:id/meal-options/:mealType/:itemIndex
router.delete("/:id/meal-options/:mealType/:itemIndex", [auth, admin], deleteMealOption);

// Bulk Pricing Update (Update all at once)
// PUT /api/packages/:id/pricing-bulk
// Body: { jeep: {...}, guide: {...}, tickets: {...}, mealOptions: {...} }
router.put("/:id/pricing-bulk", [auth, admin], bulkUpdatePricing);

export default router;