import express from 'express';
import authMiddleware from '../middleware/auth.js';
import {
  createRoom,
  getAllRooms,
  getRoomById,
  updateRoom,
  updateRoomAvailability,
  deleteRoom,
  checkRoomAvailability
} from '../Controllers/roomController.js';

const router = express.Router();

// Public routes
router.get('/', getAllRooms);
router.get('/availability/check', checkRoomAvailability);
router.get('/:id', getRoomById);

// Admin routes (protected)
router.post('/', authMiddleware, createRoom);
router.put('/:id', authMiddleware, updateRoom);
router.patch('/:id/availability', authMiddleware, updateRoomAvailability);
router.delete('/:id', authMiddleware, deleteRoom);

export default router;  // ← MUST HAVE THIS