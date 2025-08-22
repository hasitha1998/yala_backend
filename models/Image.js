const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    url: { type: String, required: true }, // File path or external URL
    category: { type: String, required: true },
    featured: { type: Boolean, default: false },
    uploadedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Image", imageSchema);