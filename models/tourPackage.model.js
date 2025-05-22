const mongoose = require('mongoose');

const TourPackageSchema = new mongoose.Schema({
  name: { type: String, required: [true, "Please provide the tour name"] },
  location: { type: String, required: true },
  price: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
}, { timestamps: true });

const Package = mongoose.model('Package', TourPackageSchema);

module.exports = Package;