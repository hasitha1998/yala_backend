const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  reservationType: String,
  park: String,
  block: String,
  jeepType: String,
  timeSlot: String,
  guideOption: String,
  visitorType: String,
  mealOption: String,
  vegOption: String,
  includeEggs: Boolean,
  includeLunch: Boolean,
  includeBreakfast: Boolean,
  people: Number,
  pickupLocation: String,
  hotelWhatsapp: String,
  accommodation: String,
  passportNumber: String,
  fullName: String,
  phoneNumber: String,
  email: String,
  nicNumber: String,
  localContact: String,
  localAccommodation: String,
  selectedDate: String,
  selectedSeats: String,
  paymentMethod: String,
  paymentStatus: { type: String, default: "pending" },
  total: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Booking", BookingSchema);