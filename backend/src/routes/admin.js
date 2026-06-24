const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Medicine = require('../models/Medicine');
const Request = require('../models/Request');
const { protect, requireRole } = require('../middleware/auth');
const { sendApprovalEmail } = require('../utils/mailer');

// GET /api/admin/stats
router.get('/stats', protect, requireRole('admin'), async (req, res) => {
  try {
    const [
      totalUsers, totalDonors, totalNGOs, pendingNGOs,
      totalMedicines, pendingMedicines, approvedMedicines, rejectedMedicines,
      totalRequests, pendingRequests, completedRequests
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
      users: { total: totalUsers, donors: totalDonors, ngos: totalNGOs, pendingNGOs },
      medicines: { total: totalMedicines, pending: pendingMedicines, approved: approvedMedicines, rejected: rejectedMedicines },
      requests: { total: totalRequests, pending: pendingRequests, completed: completedRequests },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/users
router.get('/users', protect, requireRole('admin'), async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/ngos/pending — NGOs waiting for approval
router.get('/ngos/pending', protect, requireRole('admin'), async (req, res) => {
  try {
    const ngos = await User.find({
      role: 'ngo',
      isEmailVerified: true,
      isApproved: false,
    }).sort({ createdAt: -1 });
    res.json({ ngos });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/admin/ngos/:id/approve
router.patch('/ngos/:id/approve', protect, requireRole('admin'), async (req, res) => {
  try {
    const { approve } = req.body; // true or false
    const ngo = await User.findOne({ _id: req.params.id, role: 'ngo' });
    if (!ngo) return res.status(404).json({ message: 'NGO not found' });

    ngo.isApproved = approve;
    if (approve) ngo.approvedAt = new Date();
    await ngo.save();

    // Send email notification
    try {
      await sendApprovalEmail(ngo.email, ngo.name, approve);
    } catch (emailErr) {
      console.error('Failed to send approval email:', emailErr.message);
    }

    res.json({ user: ngo, message: `NGO ${approve ? 'approved' : 'rejected'} successfully` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;