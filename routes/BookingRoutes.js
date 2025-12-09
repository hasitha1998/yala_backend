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
} from "../controllers/BookingController.js";
import auth from "../middleware/auth.js";
import admin from "../middleware/admin.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// ==========================================
// MULTER CONFIGURATION FOR BOOKING UPLOADS
// ==========================================

// Create uploads/bookings directory if it doesn't exist
const bookingUploadDir = path.join(__dirname, '../uploads/bookings');
if (!fs.existsSync(bookingUploadDir)) {
  fs.mkdirSync(bookingUploadDir, { recursive: true });
  console.log('✅ Created bookings uploads directory');
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, bookingUploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const fieldName = file.fieldname; // 'customerPhoto' or 'customerSignature'
    cb(null, `${fieldName}-${uniqueSuffix}${ext}`);
  }
});

// File filter - only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed! (jpeg, jpg, png, gif, webp)'));
  }
};

// Configure multer for multiple fields
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit per file
  },
  fileFilter: fileFilter
});

// Middleware for booking file uploads (customerPhoto and customerSignature)
const uploadBookingFiles = upload.fields([
  { name: 'customerPhoto', maxCount: 1 },
  { name: 'customerSignature', maxCount: 1 }
]);

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

// Create a new booking (WITH FILE UPLOADS)
router.post("/", uploadBookingFiles, createBooking);

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