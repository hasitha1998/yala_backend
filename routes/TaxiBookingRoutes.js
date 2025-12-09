import express from 'express';
import authMiddleware from '../middleware/auth.js';
import {
  createTaxiBooking,
  getAllTaxiBookings,
  getTaxiBookingById,
  getTaxiBookingByReference,
  updateTaxiBooking,
  updateBookingStatus,
  cancelTaxiBooking
} from '../controllers/taxiBookingController.js';

const router = express.Router();

// Public routes
router.post('/', createTaxiBooking);
router.get('/reference/:ref', getTaxiBookingByReference);
router.get('/:id', getTaxiBookingById);

// Admin routes (protected)
router.get('/', authMiddleware, getAllTaxiBookings);
router.put('/:id', authMiddleware, updateTaxiBooking);
router.patch('/:id/status', authMiddleware, updateBookingStatus);
router.delete('/:id', authMiddleware, cancelTaxiBooking);

export default router;