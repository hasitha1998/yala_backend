import express from "express";
import { 
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  updatePaymentStatus,
  deleteBooking,
  calculatePrice,
  getBookingsByDate,
  getBookingsByDateRange,
  getUserBookings
} from "../Controllers/BookingController.js";
import auth from "../middleware/auth.js";
import admin from "../middleware/admin.js";

const router = express.Router();

// ==========================================
// PUBLIC ROUTES (No Authentication Required)
// ==========================================

// Calculate price preview before booking (MUST BE FIRST)
router.post("/calculate-price", calculatePrice);

// Create a new booking
router.post("/", createBooking);

// Get user's own bookings by email or phone
router.get("/user", getUserBookings);

// Get bookings by date range (BEFORE /:id to avoid conflict)
router.get("/date-range", getBookingsByDateRange);

// Get bookings by specific date (BEFORE /:id to avoid conflict)
router.get("/date/:date", getBookingsByDate);

// ==========================================
// PROTECTED ROUTES (Authentication Required)
// ==========================================

// Get all bookings (Admin only) - SPECIFIC ROUTE
router.get("/all", [auth, admin], getAllBookings);

// Update payment status (Admin only) - BEFORE /:id
router.patch("/:id/payment-status", [auth, admin], updatePaymentStatus);

// Update booking details (Admin only)
router.put("/:id", [auth, admin], updateBooking);

// Delete booking (Admin only)
router.delete("/:id", [auth, admin], deleteBooking);

// Get booking by ID (MUST BE LAST - catches anything not matched above)
router.get("/:id", getBookingById);

export default router;