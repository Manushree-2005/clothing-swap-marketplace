const mongoose = require('mongoose');

const SwapSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  requesterListings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing' }],
  receiverListings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing' }],
  requesterTotalValue: Number,
  receiverTotalValue: Number,
  status: { type: String, enum: ['pending', 'accepted', 'declined', 'completed', 'cancelled'], default: 'pending' },
  chat: [{ sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, message: String, timestamp: Date }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Swap', SwapSchema);