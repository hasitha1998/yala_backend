import mongoose from "mongoose";

const TaxiBookingSchema = new mongoose.Schema({
  pickupLocation: { type: String, required: true },
  dropLocation: { type: String, required: true },
  pickupDate: { type: String, required: true },
  pickupTime: { type: String, required: true },
  passengers: { type: Number, required: true },
  vehicleId: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

const TaxiBooking = mongoose.model("TaxiBooking", TaxiBookingSchema);

export default TaxiBooking;