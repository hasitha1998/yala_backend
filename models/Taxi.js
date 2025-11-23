const mongoose = require('mongoose');

const taxiSchema = new mongoose.Schema({
  vehicleType: {
    type: String,
    required: true,
    enum: ['Sedan', 'SUV', 'Van', 'Mini Bus', 'Luxury Car']
  },
  vehicleName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  capacity: {
    passengers: {
      type: Number,
      required: true,
      min: 1
    },
    luggage: {
      type: Number,
      default: 2
    }
  },
  pricing: {
    basePrice: {
      type: Number,
      required: true,
      min: 0
    },
    pricePerKm: {
      type: Number,
      required: true,
      min: 0
    },
    airportTransfer: {
      type: Number,
      min: 0
    },
    fullDayRate: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  features: [{
    type: String
  }],
  images: [{
    url: String,
    caption: String,
    isFeatured: {
      type: Boolean,
      default: false
    }
  }],
  driverInfo: {
    languagesSpoken: [String],
    experience: String
  },
  serviceAreas: [{
    type: String
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for searching
taxiSchema.index({ vehicleName: 'text', description: 'text' });

module.exports = mongoose.model('Taxi', taxiSchema);