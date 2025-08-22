const Booking = require("../models/Booking");

exports.createBooking = async (req, res) => {
  try {
    // Optionally, backend validation here
    if (req.body.paymentMethod === "online" && !req.body.onlineRef) {
      return res
        .status(400)
        .json({ success: false, message: "Online reference required" });
    }
    if (req.body.paymentMethod === "bank" && !req.body.bankSlip) {
      return res
        .status(400)
        .json({ success: false, message: "Bank slip required" });
    }
    if (req.body.paymentMethod === "card") {
      if (
        !req.body.nameOnCard ||
        !req.body.cardNumber ||
        !req.body.expiryDate ||
        !req.body.cvv
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Card details required" });
      }
    }
    const booking = new Booking(req.body);
    await booking.save();
    res.status(201).json({ success: true, booking });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
