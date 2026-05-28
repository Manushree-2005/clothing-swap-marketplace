const mongoose = require('mongoose');

const ListingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  images: [String],
  category: String,
  brand: String,
  size: String,
  condition: String,
  estimatedValue: Number,
  description: String,
  status: { type: String, enum: ['available', 'pending', 'swapped'], default: 'available' },
  location: {
    lat: Number,
    lng: Number,
    city: String
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Listing', ListingSchema);