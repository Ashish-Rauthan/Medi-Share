const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
  ngo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quantityRequested: { type: Number, required: true, min: 1 },
  purpose: { type: String, required: true, trim: true },
  status: {
    type: String,
    enum: ['submitted', 'under_review', 'approved', 'rejected', 'allocated', 'completed'],
    default: 'submitted'
  },
  adminNote: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);
