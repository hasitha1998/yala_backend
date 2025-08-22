const mongoose = require('mongoose');

const dashboardStatSchema = new mongoose.Schema({
  totalBookings: Number,
  revenue: Number,
  pendingBookings: Number,
  websiteVisitors: Number,
  localVisitors: Number,
  foreignVisitors: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('DashboardStat', dashboardStatSchema);