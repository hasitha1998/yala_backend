import express from 'express';
import authMiddleware from '../middleware/auth.js';
import {
  createTaxi,
  getAllTaxis,
  getTaxiById,
  updateTaxi,
  updateTaxiAvailability,
  deleteTaxi,
  checkTaxiAvailability
} from '../Controllers/taxiController.js';

const router = express.Router();

// Public routes
router.get('/', getAllTaxis);
router.get('/availability/check', checkTaxiAvailability);
router.get('/:id', getTaxiById);

// Admin routes (protected)
router.post('/', authMiddleware, createTaxi);
router.put('/:id', authMiddleware, updateTaxi);
router.patch('/:id/availability', authMiddleware, updateTaxiAvailability);
router.delete('/:id', authMiddleware, deleteTaxi);

export default router;