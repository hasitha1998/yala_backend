const mongoose = require('mongoose');

const availableDateSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
    unique: true,
  },
});

module.exports = mongoose.model('AvailableDate', availableDateSchema);