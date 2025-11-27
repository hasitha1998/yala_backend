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
  
  // ✅ NEW: Customer Photo and Signature (Optional)
  customerPhoto: {
    type: String,  // URL/path to uploaded photo
    required: false
  },
  customerSignature: {
    type: String,  // URL/path to uploaded signature
    required: false
  },
  
  // Booking Details - SIMPLIFIED (Private Luxury only)
  reservationType: { 
    type: String, 
    required: true,
    enum: ['private'], // Only private now
    default: 'private'
  },
  park: String,
  block: String,
  jeepType: { 
    type: String,
    enum: ['luxury'], // Only luxury now
    default: 'luxury'
  },
  timeSlot: { 
    type: String, 
    required: true,
    enum: ['morning', 'afternoon', 'extended', 'fullDay']
  },
  guideOption: {
    type: String,
    enum: ['driver', 'driverGuide', 'separateGuide'],
    required: true
  },
  visitorType: { 
    type: String, 
    required: true,
    enum: ['foreign', 'local']
  },
  
  // Date and People
  date: { 
    type: Date, 
    required: true 
  },
  people: {
    type: Number,
    required: true,
    min: 1,
    max: 7
  },
  
  // Meal Options
  mealOption: {
    type: String,
    enum: ['with', 'without'],
    default: 'without'
  },
  vegOption: {
    type: String,
    enum: ['veg', 'non-veg']
  },
  includeEggs: Boolean,
  includeLunch: Boolean,
  includeBreakfast: Boolean,
  selectedBreakfastItems: [String],
  selectedLunchItems: [String],
  
  // Additional Information - Foreign Visitors
  pickupLocation: String,
  hotelWhatsapp: String,
  accommodation: String,
  passportNumber: String,
  
  // Additional Information - Local Visitors
  nicNumber: String,
  localContact: String,
  localAccommodation: String,
  
  // Special Requests
  specialRequests: String,
  
  // Pricing Information
  ticketPrice: { 
    type: Number, 
    required: true,
    default: 0 
  },
  jeepPrice: { 
    type: Number, 
    required: true,
    default: 0 
  },
  guidePrice: { 
    type: Number, 
    required: true,
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
  
  // Package Reference (if booking was made from a package)
  packageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package'
  },
  packageName: String,
  
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
  
  // Admin Notes
  adminNotes: String,
  
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Index for faster queries
BookingSchema.index({ bookingId: 1 });
BookingSchema.index({ customerEmail: 1 });
BookingSchema.index({ date: 1 });
BookingSchema.index({ status: 1 });

const Booking = mongoose.model("Booking", BookingSchema);

export default Booking;