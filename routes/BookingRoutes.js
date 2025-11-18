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
  getPendingBookings
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

// Check date availability (NEW)
router.get("/check-availability/:date", checkDateAvailability);

// Get booked dates for calendar (NEW)
router.get("/booked-dates", getBookedDates);

// Get bookings by date range (BEFORE /:id to avoid conflict)
router.get("/date-range", getBookingsByDateRange);

// Get bookings by specific date (BEFORE /:id to avoid conflict)
router.get("/date/:date", getBookingsByDate);

// ==========================================
// PROTECTED ROUTES (Authentication Required)
// ==========================================

// Get all bookings (Admin only) - SPECIFIC ROUTE
router.get("/all", [auth, admin], getAllBookings);

// Get pending bookings (Admin only) - NEW
router.get("/pending", [auth, admin], getPendingBookings);

// Approve booking (Admin only) - NEW
router.patch("/:id/approve", [auth, admin], approveBooking);

// Reject booking (Admin only) - NEW
router.patch("/:id/reject", [auth, admin], rejectBooking);

// Update payment status (Admin only) - BEFORE /:id
router.patch("/:id/payment-status", [auth, admin], updatePaymentStatus);

// Update booking details (Admin only)
router.put("/:id", [auth, admin], updateBooking);

// Delete booking (Admin only)
router.delete("/:id", [auth, admin], deleteBooking);

// Get booking by ID (MUST BE LAST - catches anything not matched above)
router.get("/:id", getBookingById);

export default router;