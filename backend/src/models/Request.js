const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  medicine:          { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
  ngo:               { type: mongoose.Schema.Types.ObjectId, ref: 'User',     required: true },
  quantityRequested: { type: Number, required: true, min: 1 },
  purpose:           { type: String, required: true, trim: true, maxlength: 500 },
  status: {
    type: String,
    enum: ['submitted', 'under_review', 'approved', 'rejected', 'allocated', 'completed'],
    default: 'submitted',
  },
  adminNote: { type: String, trim: true },
}, { timestamps: true });

// ── Indexes ───────────────────────────────────────────────────────────────────
requestSchema.index({ ngo: 1, createdAt: -1 });             // NGO's own requests
requestSchema.index({ medicine: 1, ngo: 1, status: 1 });    // duplicate request check
requestSchema.index({ status: 1, createdAt: -1 });          // admin filtering by status

module.exports = mongoose.model('Request', requestSchema);
