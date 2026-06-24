const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 1 },
  unit: { type: String, default: 'tablets', trim: true },
  expiryDate: { type: Date, required: true },
  description: { type: String, trim: true },
  category: { type: String, trim: true, default: 'General' },
  imageUrl: { type: String },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  adminNote: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Medicine', medicineSchema);
