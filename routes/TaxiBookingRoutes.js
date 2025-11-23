const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  createTaxiBooking,
  getAllTaxiBookings,
  getTaxiBookingById,
  getTaxiBookingByReference,
  updateTaxiBooking,
  updateBookingStatus,
  cancelTaxiBooking
} = require('../Controllers/taxiBookingController');

// Public routes
router.post('/', createTaxiBooking);
router.get('/reference/:ref', getTaxiBookingByReference);
router.get('/:id', getTaxiBookingById);

// Admin routes (protected)
router.get('/', authMiddleware, getAllTaxiBookings);
router.put('/:id', authMiddleware, updateTaxiBooking);
router.patch('/:id/status', authMiddleware, updateBookingStatus);
router.delete('/:id', authMiddleware, cancelTaxiBooking);

module.exports = router;