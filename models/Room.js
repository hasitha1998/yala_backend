const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  roomType: {
    type: String,
    required: true,
    enum: ['Single', 'Double', 'Suite', 'Family', 'Deluxe']
  },
  capacity: {
    adults: {
      type: Number,
      required: true,
      min: 1
    },
    children: {
      type: Number,
      default: 0
    }
  },
  pricing: {
    perNight: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  amenities: [{
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
  location: {
    address: String,
    city: String,
    nearbyAttractions: [String]
  },
  availability: {
    isAvailable: {
      type: Boolean,
      default: true
    },
    totalRooms: {
      type: Number,
      required: true,
      min: 1
    }
  },
  policies: {
    checkIn: {
      type: String,
      default: '2:00 PM'
    },
    checkOut: {
      type: String,
      default: '11:00 AM'
    },
    cancellationPolicy: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for searching
roomSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Room', roomSchema);