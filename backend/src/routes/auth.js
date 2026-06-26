const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { generateOtp, sendOtpEmail, sendApprovalEmail } = require('../utils/mailer');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// ─── Helpers ────────────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── POST /api/auth/register ─────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const {
      name, email, password, role,
      organizationName, phone, address,
    } = req.body;

    // ── Validation ──
    if (!name || !name.trim())
      return res.status(400).json({ message: 'Full name is required.' });
    if (!email || !email.trim())
      return res.status(400).json({ message: 'Email address is required.' });
    if (!EMAIL_RE.test(email.trim()))
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    if (!password)
      return res.status(400).json({ message: 'Password is required.' });
    if (password.length < 8)
      return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    if (!/[A-Z]/.test(password))
      return res.status(400).json({ message: 'Password must contain at least one uppercase letter.' });
    if (!/[0-9]/.test(password))
      return res.status(400).json({ message: 'Password must contain at least one number.' });
    if (!/[^A-Za-z0-9]/.test(password))
      return res.status(400).json({ message: 'Password must contain at least one special character.' });
    if (role && !['donor', 'ngo'].includes(role))
      return res.status(400).json({ message: 'Invalid role. Must be "donor" or "ngo".' });
    if (role === 'ngo' && (!organizationName || !organizationName.trim()))
      return res.status(400).json({ message: 'Organization name is required for NGO accounts.' });

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing)
      return res.status(409).json({ message: 'An account with this email already exists.' });

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: role || 'donor',
      organizationName: organizationName?.trim(),
      phone: phone?.trim(),
      address: address?.trim(),
      isEmailVerified: false,
      emailOtp: otp,
      emailOtpExpiry: otpExpiry,
      // NGOs need admin approval; donors are auto-approved
      isApproved: role === 'ngo' ? false : true,
    });

    try {
      await sendOtpEmail(normalizedEmail, name.trim(), otp);
    } catch (mailErr) {
      // Don't fail registration if mail fails — log it and continue
      console.error('OTP email failed:', mailErr.message);
    }

    res.status(201).json({
      message: 'Registration successful. Please check your email for the OTP.',
      userId: user._id,
      role: user.role,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
});

// ─── POST /api/auth/verify-otp ───────────────────────────────────────────────
router.post('/verify-otp', async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp)
      return res.status(400).json({ message: 'User ID and OTP are required.' });
    if (!/^\d{6}$/.test(otp))
      return res.status(400).json({ message: 'OTP must be a 6-digit number.' });

    const user = await User.findById(userId).select('+emailOtp +emailOtpExpiry');
    if (!user)
      return res.status(404).json({ message: 'Account not found. Please register again.' });
    if (user.isEmailVerified)
      return res.status(400).json({ message: 'This email has already been verified. Please log in.' });
    if (!user.emailOtp)
      return res.status(400).json({ message: 'No OTP found. Please request a new one.' });
    if (user.emailOtpExpiry < new Date())
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    if (user.emailOtp !== otp)
      return res.status(400).json({ message: 'Incorrect OTP. Please check your email and try again.' });

    user.isEmailVerified = true;
    user.emailOtp = undefined;
    user.emailOtpExpiry = undefined;
    await user.save();

    // NGO: don't issue token — needs admin approval first
    if (user.role === 'ngo') {
      return res.json({
        message: 'Email verified! Your NGO account is pending admin approval.',
        pendingApproval: true,
      });
    }

    // Donor: issue token immediately
    const token = signToken(user._id);
    res.json({ token, user, message: 'Email verified successfully!' });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ message: 'Verification failed. Please try again.' });
  }
});

// ─── POST /api/auth/resend-otp ───────────────────────────────────────────────
router.post('/resend-otp', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId)
      return res.status(400).json({ message: 'User ID is required.' });

    const user = await User.findById(userId).select('+emailOtp +emailOtpExpiry');
    if (!user)
      return res.status(404).json({ message: 'Account not found.' });
    if (user.isEmailVerified)
      return res.status(400).json({ message: 'This email has already been verified.' });

    // Rate-limit: don't allow resend if previous OTP was sent less than 60s ago
    if (user.emailOtpExpiry) {
      const otpAge = (user.emailOtpExpiry - Date.now()) / 1000; // seconds remaining
      const maxAge = 10 * 60; // 10 min total
      const sentSecondsAgo = maxAge - otpAge;
      if (sentSecondsAgo < 60) {
        return res.status(429).json({
          message: `Please wait ${Math.ceil(60 - sentSecondsAgo)} seconds before requesting a new OTP.`,
        });
      }
    }

    const otp = generateOtp();
    user.emailOtp = otp;
    user.emailOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    try {
      await sendOtpEmail(user.email, user.name, otp);
    } catch (mailErr) {
      console.error('Resend OTP email failed:', mailErr.message);
      return res.status(500).json({ message: 'Failed to send OTP email. Please try again.' });
    }

    res.json({ message: 'A new OTP has been sent to your email.' });
  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(500).json({ message: 'Failed to resend OTP. Please try again.' });
  }
});

// ─── POST /api/auth/login ────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !email.trim())
      return res.status(400).json({ message: 'Email address is required.' });
    if (!password)
      return res.status(400).json({ message: 'Password is required.' });

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail }).select('+emailOtp +emailOtpExpiry');
    if (!user || !(await user.comparePassword(password))) {
      // Generic message intentional — don't reveal whether email exists
      return res.status(401).json({ message: 'Incorrect email or password.' });
    }

    // Email not verified — resend OTP and block login
    if (!user.isEmailVerified) {
      const otp = generateOtp();
      user.emailOtp = otp;
      user.emailOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();
      try {
        await sendOtpEmail(user.email, user.name, otp);
      } catch (mailErr) {
        console.error('Login OTP resend failed:', mailErr.message);
      }
      return res.status(403).json({
        message: 'Your email is not verified. A new OTP has been sent to your email.',
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
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
});

// ─── GET /api/auth/me ────────────────────────────────────────────────────────
router.get('/me', protect, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
