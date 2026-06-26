const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Medicine = require('../models/Medicine');
const Request = require('../models/Request');
const { protect, requireRole } = require('../middleware/auth');
const { sendApprovalEmail } = require('../utils/mailer');

// ─── GET /api/admin/stats ─────────────────────────────────────────────────────
router.get('/stats', protect, requireRole('admin'), async (req, res) => {
  try {
    const [
      totalUsers, totalDonors, totalNGOs, pendingNGOs,
      totalMedicines, pendingMedicines, approvedMedicines, rejectedMedicines,
      totalRequests, pendingRequests, completedRequests,
    ] = await Promise.all([
      User.countDocuments({ role: { $ne: 'admin' } }),
      User.countDocuments({ role: 'donor' }),
      User.countDocuments({ role: 'ngo', isApproved: true }),
      User.countDocuments({ role: 'ngo', isApproved: false, isEmailVerified: true }),
      Medicine.countDocuments(),
      Medicine.countDocuments({ status: 'pending' }),
      Medicine.countDocuments({ status: 'approved' }),
      Medicine.countDocuments({ status: 'rejected' }),
      Request.countDocuments(),
      Request.countDocuments({ status: { $in: ['submitted', 'under_review'] } }),
      Request.countDocuments({ status: 'completed' }),
    ]);

    res.json({
      users:     { total: totalUsers, donors: totalDonors, ngos: totalNGOs, pendingNGOs },
      medicines: { total: totalMedicines, pending: pendingMedicines, approved: approvedMedicines, rejected: rejectedMedicines },
      requests:  { total: totalRequests, pending: pendingRequests, completed: completedRequests },
    });
  } catch (err) {
    console.error('GET /admin/stats error:', err);
    res.status(500).json({ message: 'Failed to load dashboard stats. Please refresh.' });
  }
});

// ─── GET /api/admin/users ─────────────────────────────────────────────────────
router.get('/users', protect, requireRole('admin'), async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ users });
  } catch (err) {
    console.error('GET /admin/users error:', err);
    res.status(500).json({ message: 'Failed to fetch users. Please try again.' });
  }
});

// ─── GET /api/admin/ngos/pending ──────────────────────────────────────────────
router.get('/ngos/pending', protect, requireRole('admin'), async (req, res) => {
  try {
    const ngos = await User.find({
      role: 'ngo',
      isEmailVerified: true,
      isApproved: false,
    })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ ngos });
  } catch (err) {
    console.error('GET /admin/ngos/pending error:', err);
    res.status(500).json({ message: 'Failed to fetch pending NGOs. Please try again.' });
  }
});

// ─── PATCH /api/admin/ngos/:id/approve ───────────────────────────────────────
router.patch('/ngos/:id/approve', protect, requireRole('admin'), async (req, res) => {
  try {
    const { approve } = req.body;

    if (typeof approve !== 'boolean')
      return res.status(400).json({ message: '"approve" must be a boolean (true or false).' });

    const ngo = await User.findOne({ _id: req.params.id, role: 'ngo' });
    if (!ngo)
      return res.status(404).json({ message: 'NGO account not found.' });

    if (!ngo.isEmailVerified)
      return res.status(400).json({ message: 'This NGO has not verified their email yet.' });

    if (ngo.isApproved && approve)
      return res.status(400).json({ message: 'This NGO is already approved.' });

    ngo.isApproved = approve;
    if (approve) ngo.approvedAt = new Date();
    await ngo.save();

    // Send email notification — don't fail the request if mail fails
    try {
      await sendApprovalEmail(ngo.email, ngo.name, approve);
    } catch (mailErr) {
      console.error('NGO approval email failed:', mailErr.message);
    }

    res.json({
      user: ngo,
      message: `NGO ${approve ? 'approved' : 'rejected'} successfully.`,
    });
  } catch (err) {
    console.error('PATCH /admin/ngos/:id/approve error:', err);
    res.status(500).json({ message: 'Failed to update NGO status. Please try again.' });
  }
});

module.exports = router;
