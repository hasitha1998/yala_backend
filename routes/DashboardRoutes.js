import express from "express";
import Booking from "../models/Booking.js";
import DashboardStat from "../models/DashboardStat.js";
import auth from "../middleware/auth.js";
import admin from "../middleware/admin.js";

const router = express.Router();

// GET /api/dashboard/overview (admin only)
router.get("/overview", [auth, admin], async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const revenueAgg = await Booking.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const revenue = revenueAgg[0]?.total || 0;
    const pendingBookings = await Booking.countDocuments({ status: "pending" });
    const localVisitors = await Booking.countDocuments({
      visitorType: "local",
    });
    const foreignVisitors = await Booking.countDocuments({
      visitorType: "foreign",
    });
    const websiteVisitors = localVisitors + foreignVisitors;

    // Save snapshot to DashboardStat collection
    await DashboardStat.create({
      totalBookings,
      revenue,
      pendingBookings,
      websiteVisitors,
      localVisitors,
      foreignVisitors,
    });

    // Recent bookings (latest 10)
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select(
        "name email phone participants date timeSlot status totalAmount createdAt"
      );

    res.json({
      stats: {
        totalBookings,
        revenue,
        pendingBookings,
        websiteVisitors,
        localVisitors,
        foreignVisitors,
      },
      recentBookings,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

export default router;
