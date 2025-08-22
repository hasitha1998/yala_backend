const { privateDates, sharedDates } = require("../models/Date");

exports.getAvailability = (req, res) => {
  const { type, park } = req.query;
  if (type === "private") {
    res.json({ dates: privateDates });
  } else if (type === "shared" && park === "yala") {
    res.json({ dates: sharedDates });
  } else {
    res.json({ dates: [] });
  }
};