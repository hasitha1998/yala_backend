import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
  // Booking ID
  bookingId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  
  // Customer Information
  customerName: { 
    type: String, 
    required: true 
  },
  customerEmail: { 
    type: String, 
    required: true 
  },
  customerPhone: { 
    type: String, 
    required: true 
  },
  
  // Booking Details
  reservationType: { 
    type: String, 
    required: true,
    enum: ['private', 'shared']
  },
  park: String,
  block: String,
  jeepType: String,
  timeSlot: { 
    type: String, 
    required: true 
  },
  guideOption: String,
  visitorType: { 
    type: String, 
    required: true,
    enum: ['foreign', 'local']
  },
  
  // Date and Seats
  date: { 
    type: Date, 
    required: true 
  },
  selectedSeats: String,
  people: Number,
  
  // Meal Options
  mealOption: String,
  vegOption: String,
  includeEggs: Boolean,
  includeLunch: Boolean,
  includeBreakfast: Boolean,
  selectedBreakfastItems: [String],
  selectedLunchItems: [String],
  
  // Additional Information
  pickupLocation: String,
  hotelWhatsapp: String,
  accommodation: String,
  passportNumber: String,
  nicNumber: String,
  localContact: String,
  localAccommodation: String,
  specialRequests: String,
  
  // Pricing Information (CRITICAL - MISSING IN YOUR MODEL)
  ticketPrice: { 
    type: Number, 
    default: 0 
  },
  jeepPrice: { 
    type: Number, 
    default: 0 
  },
  guidePrice: { 
    type: Number, 
    default: 0 
  },
  mealPrice: { 
    type: Number, 
    default: 0 
  },
  totalPrice: { 
    type: Number, 
    required: true 
  },
  
  // Status
  status: { 
    type: String, 
    default: 'pending',
    enum: ['pending', 'confirmed', 'cancelled', 'completed']
  },
  paymentStatus: { 
    type: String, 
    default: 'pending',
    enum: ['pending', 'paid', 'failed', 'refunded']
  },
  adminNotes: String,
  
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

const Booking = mongoose.model("Booking", BookingSchema);

export default Booking;