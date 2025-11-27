import mongoose from "mongoose";

const GallerySchema = new mongoose.Schema({
  // Image Information
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  
  // Gallery Category
  category: {
    type: String,
    required: true,
    enum: ['wildlife', 'trips', 'customers', 'landscapes', 'activities', 'other'],
    default: 'other'
  },
  
  // Tags for better search
  tags: [{
    type: String,
    trim: true
  }],
  
  // Image Metadata
  photographer: {
    type: String,
    default: 'Yala Safari Tours'
  },
  location: String,
  captureDate: Date,
  
  // Display Settings
  featured: {
    type: Boolean,
    default: false
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Stats
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  
  // Upload Information
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  fileSize: Number, // in bytes
  dimensions: {
    width: Number,
    height: Number
  },
  
}, {
  timestamps: true
});

// Indexes
GallerySchema.index({ category: 1, isActive: 1 });
GallerySchema.index({ featured: 1, displayOrder: 1 });
GallerySchema.index({ tags: 1 });
GallerySchema.index({ createdAt: -1 });

const Gallery = mongoose.model("Gallery", GallerySchema);

export default Gallery;