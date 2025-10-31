import mongoose from 'mongoose';

const availableDateSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
    unique: true,
  },
});

const AvailableDate = mongoose.model('AvailableDate', availableDateSchema);

export default AvailableDate;