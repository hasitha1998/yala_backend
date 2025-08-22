const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  jeep: {
    basic: {
      morning: { type: Number, required: true },
      afternoon: { type: Number, required: true },
      extended: { type: Number, required: true },
      fullDay: { type: Number, required: true }
    },
    luxury: {
      morning: { type: Number, required: true },
      afternoon: { type: Number, required: true },
      extended: { type: Number, required: true },
      fullDay: { type: Number, required: true }
    },
    superLuxury: {
      morning: { type: Number, required: true },
      afternoon: { type: Number, required: true },
      extended: { type: Number, required: true },
      fullDay: { type: Number, required: true }
    }
  },
  shared: {
    1: { type: Number, required: true },
    2: { type: Number, required: true },
    3: { type: Number, required: true },
    4: { type: Number, required: true },
    5: { type: Number, required: true },
    6: { type: Number, required: true },
    7: { type: Number, required: true }
  },
  meals: {
    breakfast: { type: Number, required: true },
    lunch: { type: Number, required: true }
  },
  guide: {
    driver: { type: Number, required: true },
    driverGuide: { type: Number, required: true },
    separateGuide: { type: Number, required: true }
  }
}, { timestamps: true });

// Create default package if none exists
packageSchema.statics.initialize = async function() {
  const count = await this.countDocuments();
  if (count === 0) {
    await this.create({
      jeep: {
        basic: { morning: 5, afternoon: 5, extended: 7, fullDay: 10 },
        luxury: { morning: 7, afternoon: 7, extended: 9, fullDay: 12 },
        superLuxury: { morning: 10, afternoon: 10, extended: 12, fullDay: 15 }
      },
      shared: {
        1: 10, 2: 8, 3: 7, 4: 5, 5: 5, 6: 5, 7: 5
      },
      meals: {
        breakfast: 5,
        lunch: 6
      },
      guide: {
        driver: 0,
        driverGuide: 10,
        separateGuide: 15
      }
    });
  }
};

module.exports = mongoose.model('Package', packageSchema);