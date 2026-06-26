const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  quantity:    { type: Number, required: true, min: 0 },
  unit:        { type: String, default: 'tablets', trim: true },
  expiryDate:  { type: Date,   required: true },
  description: { type: String, trim: true, maxlength: 500 },
  category:    { type: String, trim: true, default: 'General' },
  imageUrl:    { type: String },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  donor:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  adminNote: { type: String, trim: true },
}, { timestamps: true });

// ── Indexes ───────────────────────────────────────────────────────────────────
medicineSchema.index({ donor: 1, createdAt: -1 });         // donor's own listings
medicineSchema.index({ status: 1, quantity: 1, createdAt: -1 }); // NGO browse (approved + qty > 0)
medicineSchema.index({ name: 'text' });                    // text search fallback (optional)

module.exports = mongoose.model('Medicine', medicineSchema);
