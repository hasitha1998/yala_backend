import express from 'express';

const router = express.Router();

// Dummy jeep data (replace with DB query for real app)
const allJeeps = [
  { id: 1, name: "Basic Jeep", features: ["Standard seating", "Pop-up roof"] },
  { id: 2, name: "Luxury Jeep", features: ["Comfortable seats", "Charging ports"] },
  { id: 3, name: "Super Luxury", features: ["Premium seats", "360° viewing"] },
];

// GET /api/available-jeeps?date=YYYY-MM-DD
router.get('/available-jeeps', (req, res) => {
  const { date } = req.query;
  // You can filter jeeps by date here if you have booking data
  res.json({ jeeps: allJeeps });
});

export default router;