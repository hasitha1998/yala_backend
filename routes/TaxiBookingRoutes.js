const express = require("express");
const router = express.Router();
const taxiBookingController = require("../controllers/taxiBookingController");

router.post("/", taxiBookingController.createBooking);
router.get("/", taxiBookingController.getBookings);

module.exports = router;