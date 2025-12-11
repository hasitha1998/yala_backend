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
      enum: ['yala', 'bundala', 'udawalawe', 'Lunugamwehera'],
    },
    block: {
      type: String,
      enum: ['blockI', 'blockII', 'blockIIIIV', 'blockV'],
    },
    
    // Package Type - REMOVED SHARED OPTION
    packageType: {
      type: String,
      required: true,
      enum: ['private'], // Only private now
      default: 'private',
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
    
    // Pricing Structure - Jeep Options
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
    
    // REMOVED: shared safari pricing
    
    // Dynamic Meal Options
    mealOptions: {
      breakfast: [
        {
          name: { type: String, required: true },
          price: { type: Number, required: true },
          isVegetarian: { type: Boolean, default: false },
          description: String,
        }
      ],
      lunch: [
        {
          name: { type: String, required: true },
          price: { type: Number, required: true },
          isVegetarian: { type: Boolean, default: false },
          description: String,
        }
      ],
    },
    
    // Legacy meals pricing (keep for backward compatibility)
    meals: {
      breakfast: { type: Number, required: true },
      lunch: { type: Number, required: true },
    },
    
    // Guide Options
    guide: {
      driver: { type: Number, required: true, default: 0 },
      driverGuide: { type: Number, required: true },
      separateGuide: { type: Number, required: true },
    },
    
    // Tickets
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
      description: "Complete private safari experience with all parks available",
      park: "yala",
      packageType: "private", // Only private
      jeep: {
        basic: { morning: 45, afternoon: 45, extended: 50, fullDay: 90 },
        luxury: { morning: 65, afternoon: 65, extended: 70, fullDay: 130 },
        superLuxury: { morning: 65, afternoon: 65, extended: 70, fullDay: 130 },
      },
      meals: { breakfast: 5, lunch: 6 },
      guide: { driver: 0, driverGuide: 15, separateGuide: 25 },
      tickets: { foreign: 15, local: 5 },
      mealOptions: {
        breakfast: [
          { name: "Fresh tropical fruits", price: 2, isVegetarian: true },
          { name: "Toast & butter/jam", price: 1, isVegetarian: true },
          { name: "Pasta (any style)", price: 1.5, isVegetarian: false },
          { name: "Sandwiches", price: 1, isVegetarian: false },
          { name: "Local Sri Lankan pancakes", price: 1.5, isVegetarian: true },
          { name: "Tea or coffee", price: 1, isVegetarian: true },
        ],
        lunch: [
          { name: "Rice & curry (veg)", price: 3, isVegetarian: true },
          { name: "Rice & curry (non-veg)", price: 3, isVegetarian: false },
          { name: "Grilled chicken or fish", price: 2.5, isVegetarian: false },
          { name: "Fresh salad", price: 1.5, isVegetarian: true },
          { name: "Seasonal fruit dessert", price: 1.5, isVegetarian: true },
          { name: "Bottled water & soft drink", price: 1, isVegetarian: true },
        ],
      },
      features: ["Professional Guide", "All Equipment Included", "Wildlife Spotting"],
      highlights: ["Leopard Sightings", "Elephant Herds", "Bird Watching"],
      isActive: true,
    });
  }
};

const Package = mongoose.model("Package", PackageSchema);

export default Package;