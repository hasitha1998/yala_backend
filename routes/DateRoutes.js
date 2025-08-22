const express = require("express");
const router = express.Router();
const { getAvailability } = require("../Controllers/DateController");

router.get("/availability", getAvailability);

module.exports = router;