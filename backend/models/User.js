const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  city: String,
  postalCode: String,
  lat: Number,
  lng: Number,
  swapHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Swap' }],
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);