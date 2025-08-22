const TaxiBooking = require("../models/TaxiBooking");

exports.createBooking = async (req, res) => {
  try {
    const booking = new TaxiBooking(req.body);
    await booking.save();
    res.status(201).json({ success: true, booking });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const bookings = await TaxiBooking.find().sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};