import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema({
  // Review ID
  reviewId: {
    type: String,
    required: true,
    unique: true
  },
  
  // Customer Information
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  customerEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  customerPhone: {
    type: String,
    trim: true
  },
  
  // Customer Photo and Signature (Optional)
  customerPhoto: {
    type: String,  // URL/path to uploaded photo
    required: false
  },
  customerSignature: {
    type: String,  // URL/path to uploaded signature
    required: false
  },
  
  // Review Content
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  reviewMessage: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 1000
  },
  
  // Optional: Link to booking (if review is for a specific booking)
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  bookingReference: {
    type: String
  },
  
  // Service Type (what they're reviewing)
  serviceType: {
    type: String,
    enum: ['safari', 'room', 'taxi', 'overall', 'other'],
    default: 'overall'
  },
  
  // Review Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  
  // Featured Review
  isFeatured: {
    type: Boolean,
    default: false
  },
  featuredOrder: {
    type: Number,
    default: 0
  },
  
  // Admin Response
  adminResponse: {
    type: String,
    trim: true
  },
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  respondedAt: {
    type: Date
  },
  
  // Engagement Stats
  helpfulCount: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  
  // Admin Notes (not visible to public)
  adminNotes: {
    type: String
  },
  
  // Verification
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedAt: {
    type: Date
  },
  
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Indexes for faster queries
ReviewSchema.index({ reviewId: 1 });
ReviewSchema.index({ customerEmail: 1 });
ReviewSchema.index({ rating: 1 });
ReviewSchema.index({ status: 1, isPublished: 1 });
ReviewSchema.index({ isFeatured: 1, featuredOrder: 1 });
ReviewSchema.index({ createdAt: -1 });
ReviewSchema.index({ serviceType: 1 });

// Virtual for formatted rating
ReviewSchema.virtual('formattedRating').get(function() {
  return '⭐'.repeat(this.rating);
});

// Method to check if review can be edited
ReviewSchema.methods.canEdit = function() {
  return this.status === 'pending';
};

const Review = mongoose.model("Review", ReviewSchema);

export default Review;