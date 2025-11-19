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
  getUserBookings,
  approveBooking,
  rejectBooking,
  checkDateAvailability,
  getBookedDates,
  getPendingBookings,
  getBookingStats
} from "../Controllers/BookingController.js";
import auth from "../middleware/auth.js";
import admin from "../middleware/admin.js";

const router = express.Router();

// ==========================================
// PUBLIC ROUTES (MUST BE BEFORE ANY :param ROUTES)
// ==========================================

// Calculate price preview (FIRST)
router.post("/calculate-price", calculatePrice);

// Check date availability - CRITICAL: Must be before /:id
router.get("/check-availability/:date", checkDateAvailability);

// Get booked dates for calendar
router.get("/booked-dates", getBookedDates);

// Get user's own bookings
router.get("/user", getUserBookings);

// Get bookings by date range
router.get("/date-range", getBookingsByDateRange);

// Create a new booking
router.post("/", createBooking);

// ==========================================
// ADMIN ROUTES (Specific routes before generic)
// ==========================================

// Get all bookings (Admin)
router.get("/all", [auth, admin], getAllBookings);

// Get pending bookings (Admin)
router.get("/pending", [auth, admin], getPendingBookings);

// Get booking stats (Admin)
router.get("/stats/overview", [auth, admin], getBookingStats);

// Approve booking (Admin)
router.patch("/:id/approve", [auth, admin], approveBooking);

// Reject booking (Admin)
router.patch("/:id/reject", [auth, admin], rejectBooking);

// Update payment status (Admin)
router.patch("/:id/payment-status", [auth, admin], updatePaymentStatus);

// Get bookings by specific date (Admin)
router.get("/date/:date", [auth, admin], getBookingsByDate);

// Update booking (Admin)
router.put("/:id", [auth, admin], updateBooking);

// Delete booking (Admin)
router.delete("/:id", [auth, admin], deleteBooking);

// ==========================================
// DYNAMIC ROUTES (MUST BE ABSOLUTE LAST)
// ==========================================

// Get booking by ID - MUST BE LAST
router.get("/:id", getBookingById);

export default router;