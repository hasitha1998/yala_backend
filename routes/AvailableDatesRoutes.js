import express from "express";
import AvailableDate from "../models/AvailableDate.js";
import auth from "../middleware/auth.js";
import admin from "../middleware/admin.js";

const router = express.Router();

// Get all available dates (requires authentication)
router.get("/", auth, async (req, res) => {
  const dates = await AvailableDate.find({});
  res.json(dates.map((d) => d.date));
});

// Add a new available date (admin only)
router.post("/", [auth, admin], async (req, res) => {
  const { date } = req.body;
  if (!date) return res.status(400).json({ error: "Date is required" });
  await AvailableDate.create({ date });
  res.json({ success: true });
});

export default router;
