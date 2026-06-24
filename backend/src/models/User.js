const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['donor', 'ngo', 'admin'], default: 'donor' },
  organizationName: { type: String, trim: true },
  phone: { type: String, trim: true },
  address: { type: String, trim: true },

  // Email verification
  isEmailVerified: { type: Boolean, default: false },
  emailOtp: { type: String },
  emailOtpExpiry: { type: Date },

  // NGO admin approval
  isApproved: { type: Boolean, default: true }, // donors auto-approved, NGOs set to false on register
  approvedAt: { type: Date },
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.emailOtp;
  delete obj.emailOtpExpiry;
  return obj;
};

module.exports = mongoose.model('User', userSchema);