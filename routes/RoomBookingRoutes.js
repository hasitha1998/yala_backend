import express from 'express';
import authMiddleware from '../middleware/auth.js';
import {
  createRoomBooking,
  getAllRoomBookings,
  getRoomBookingById,
  getRoomBookingByReference,
  calculateRoomPrice,
  updateRoomBooking,
  updateBookingStatus,
  cancelRoomBooking
} from '../controllers/roomBookingController.js';

const router = express.Router();

// Public routes
router.post('/', createRoomBooking);
router.post('/calculate-price', calculateRoomPrice);
router.get('/reference/:ref', getRoomBookingByReference);
router.get('/:id', getRoomBookingById);

// Admin routes (protected)
router.get('/', authMiddleware, getAllRoomBookings);
router.put('/:id', authMiddleware, updateRoomBooking);
router.patch('/:id/status', authMiddleware, updateBookingStatus);
router.delete('/:id', authMiddleware, cancelRoomBooking);

export default router;