const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { generateOtp, sendOtpEmail, sendApprovalEmail } = require('../utils/mailer');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, organizationName, phone, address } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required' });
    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    if (role && !['donor', 'ngo'].includes(role))
      return res.status(400).json({ message: 'Invalid role' });
    if (role === 'ngo' && !organizationName)
      return res.status(400).json({ message: 'Organization name is required for NGOs' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    const user = await User.create({
      name, email, password,
      role: role || 'donor',
      organizationName, phone, address,
      isEmailVerified: false,
      emailOtp: otp,
      emailOtpExpiry: otpExpiry,
      // NGOs need admin approval; donors are auto-approved
      isApproved: role === 'ngo' ? false : true,
    });

    await sendOtpEmail(email, name, otp);

    res.status(201).json({
      message: 'Registration successful. Please check your email for the OTP.',
      userId: user._id,
      role: user.role,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { userId, otp } = req.body;
    if (!userId || !otp)
      return res.status(400).json({ message: 'userId and otp are required' });

    const user = await User.findById(userId).select('+emailOtp +emailOtpExpiry');
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isEmailVerified)
      return res.status(400).json({ message: 'Email already verified' });
    if (!user.emailOtp || user.emailOtp !== otp)
      return res.status(400).json({ message: 'Invalid OTP' });
    if (user.emailOtpExpiry < new Date())
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });

    user.isEmailVerified = true;
    user.emailOtp = undefined;
    user.emailOtpExpiry = undefined;
    await user.save();

    // NGO: don't issue token yet — needs admin approval
    if (user.role === 'ngo') {
      return res.json({
        message: 'Email verified! Your NGO account is pending admin approval. You will be notified by email.',
        pendingApproval: true,
      });
    }

    // Donor: issue token immediately
    const token = signToken(user._id);
    res.json({ token, user, message: 'Email verified successfully!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/resend-otp
router.post('/resend-otp', async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId).select('+emailOtp +emailOtpExpiry');
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isEmailVerified)
      return res.status(400).json({ message: 'Email already verified' });

    const otp = generateOtp();
    user.emailOtp = otp;
    user.emailOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOtpEmail(user.email, user.name, otp);
    res.json({ message: 'New OTP sent to your email.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email }).select('+emailOtp +emailOtpExpiry');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });

    // Email not verified — resend OTP and block login
    if (!user.isEmailVerified) {
      const otp = generateOtp();
      user.emailOtp = otp;
      user.emailOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();
      await sendOtpEmail(user.email, user.name, otp);
      return res.status(403).json({
        message: 'Email not verified. A new OTP has been sent to your email.',
        userId: user._id,
        needsVerification: true,
      });
    }

    // NGO not yet approved
    if (user.role === 'ngo' && !user.isApproved) {
      return res.status(403).json({
        message: 'Your NGO account is pending admin approval. You will be notified by email once approved.',
        pendingApproval: true,
      });
    }

    const token = signToken(user._id);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;