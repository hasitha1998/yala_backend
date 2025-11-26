import mongoose from 'mongoose';

const taxiBookingSchema = new mongoose.Schema({
  bookingReference: {
    type: String,
    required: true,
    unique: true
  },
  taxi: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Taxi',
    required: true
  },
  customerDetails: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: true
    },
    country: String
  },
  tripDetails: {
    serviceType: {
      type: String,
      required: true,
      enum: ['Airport Transfer', 'City Tour', 'Point to Point', 'Full Day Rental', 'Custom']
    },
    pickupLocation: {
      type: String,
      required: true
    },
    dropoffLocation: {
      type: String,
      required: true
    },
    pickupDate: {
      type: Date,
      required: true
    },
    pickupTime: {
      type: String,
      required: true
    },
    distance: {
      type: Number, // in kilometers
      min: 0
    },
    duration: {
      type: Number, // in hours
      min: 0
    }
  },
  passengers: {
    adults: {
      type: Number,
      required: true,
      min: 1
    },
    children: {
      type: Number,
      default: 0
    },
    luggage: {
      type: Number,
      default: 0
    }
  },
  pricing: {
    basePrice: {
      type: Number,
      required: true
    },
    distanceCharge: {
      type: Number,
      default: 0
    },
    additionalCharges: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  specialRequests: {
    type: String
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'paid', 'cancelled', 'refunded'],
    default: 'pending'
  },
  bookingStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'pending'
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Generate booking reference before saving
taxiBookingSchema.pre('save', async function(next) {
  if (!this.bookingReference) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.bookingReference = `TAXI-${timestamp}-${random}`;
  }
  next();
});

export default mongoose.model('TaxiBooking', taxiBookingSchema);