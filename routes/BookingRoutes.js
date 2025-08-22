const express = require("express");
const router = express.Router();
const { createBooking } = require("../Controllers/BookingController");

router.post("/booking", createBooking);

module.exports = router;
