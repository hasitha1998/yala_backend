import mongoose from "mongoose";

const PackageSchema = new mongoose.Schema(
  {
    // Package Basic Info
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    park: {
      type: String,
      required: true,
      enum: ['yala', 'bundala', 'udawalawe', 'Lunugamwehera'],
    },
    block: {
      type: String,
      enum: ['blockI', 'blockII', 'blockIIIIV', 'blockV'],
    },
    
    // Package Type
    packageType: {
      type: String,
      required: true,
      enum: ['private', 'shared', 'both'],
      default: 'both',
    },
    
    // Availability
    isActive: {
      type: Boolean,
      default: true,
    },
    availableDates: {
      startDate: Date,
      endDate: Date,
    },
    maxCapacity: {
      type: Number,
      default: 7,
    },
    
    // Pricing Structure (Keep existing structure)
    jeep: {
      basic: {
        morning: { type: Number, required: true },
        afternoon: { type: Number, required: true },
        extended: { type: Number, required: true },
        fullDay: { type: Number, required: true },
      },
      luxury: {
        morning: { type: Number, required: true },
        afternoon: { type: Number, required: true },
        extended: { type: Number, required: true },
        fullDay: { type: Number, required: true },
      },
      superLuxury: {
        morning: { type: Number, required: true },
        afternoon: { type: Number, required: true },
        extended: { type: Number, required: true },
        fullDay: { type: Number, required: true },
      },
    },
    
    shared: {
      1: { type: Number, required: true },
      2: { type: Number, required: true },
      3: { type: Number, required: true },
      4: { type: Number, required: true },
      5: { type: Number, required: true },
      6: { type: Number, required: true },
      7: { type: Number, required: true },
    },
    
    meals: {
      breakfast: { type: Number, required: true },
      lunch: { type: Number, required: true },
    },
    
    guide: {
      driver: { type: Number, required: true, default: 0 },
      driverGuide: { type: Number, required: true },
      separateGuide: { type: Number, required: true },
    },
    
    // Tickets (NEW)
    tickets: {
      foreign: { type: Number, required: true, default: 15 },
      local: { type: Number, required: true, default: 5 },
    },
    
    // Features & Highlights
    features: [String],
    highlights: [String],
    
    // Images
    images: [String],
    featuredImage: String,
    
    // Stats
    totalBookings: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    
    // Admin Info
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  {
    timestamps: true,
  }
);

// Static method to initialize default pricing
PackageSchema.statics.initialize = async function() {
  const count = await this.countDocuments();
  if (count === 0) {
    await this.create({
      name: "Standard Safari Package",
      description: "Complete safari experience with all parks available",
      park: "yala",
      packageType: "both",
      jeep: {
        basic: { morning: 5, afternoon: 5, extended: 7, fullDay: 10 },
        luxury: { morning: 7, afternoon: 7, extended: 9, fullDay: 12 },
        superLuxury: { morning: 10, afternoon: 10, extended: 12, fullDay: 15 },
      },
      shared: { 1: 10, 2: 8, 3: 7, 4: 5, 5: 5, 6: 5, 7: 5 },
      meals: { breakfast: 5, lunch: 6 },
      guide: { driver: 0, driverGuide: 10, separateGuide: 15 },
      tickets: { foreign: 15, local: 5 },
      features: ["Professional Guide", "All Equipment Included", "Wildlife Spotting"],
      highlights: ["Leopard Sightings", "Elephant Herds", "Bird Watching"],
      isActive: true,
    });
  }
};

const Package = mongoose.model("Package", PackageSchema);

export default Package;