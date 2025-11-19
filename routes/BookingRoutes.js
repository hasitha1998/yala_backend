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
// PUBLIC ROUTES (Specific routes FIRST)
// ==========================================

// Calculate price preview (MUST BE FIRST)
router.post("/calculate-price", calculatePrice);

// Get booked dates for calendar (BEFORE any :param routes)
router.get("/booked-dates", getBookedDates);

// Check date availability (BEFORE any :param routes)
router.get("/check-availability/:date", checkDateAvailability);


// Get user's own bookings by email or phone
router.get("/user", getUserBookings);

// Get bookings by date range (BEFORE /:id)
router.get("/date-range", getBookingsByDateRange);

// Create a new booking
router.post("/", createBooking);

// ==========================================
// PROTECTED ROUTES (Admin only - Specific before generic)
// ==========================================

// Get all bookings (Admin) - /all route
router.get("/all", [auth, admin], getAllBookings);

// Get pending bookings (Admin) - /pending route
router.get("/pending", [auth, admin], getPendingBookings);

// Approve booking (Admin) - /:id/approve
router.patch("/:id/approve", [auth, admin], approveBooking);

// Reject booking (Admin) - /:id/reject
router.patch("/:id/reject", [auth, admin], rejectBooking);

// Update payment status (Admin) - /:id/payment-status
router.patch("/:id/payment-status", [auth, admin], updatePaymentStatus);

// Get bookings by specific date (Admin) - /date/:date
router.get("/date/:date", [auth, admin], getBookingsByDate);

// Update booking (Admin)
router.put("/:id", [auth, admin], updateBooking);

// Delete booking (Admin)
router.delete("/:id", [auth, admin], deleteBooking);

// ==========================================
// DYNAMIC ROUTES (MUST BE LAST)
// ==========================================

// Get booking by ID (LAST - catches remaining GET /:id)
router.get("/:id", getBookingById);

export default router;