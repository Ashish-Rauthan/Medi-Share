const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');
const { protect, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

// GET /api/medicines - NGO sees approved, Donor sees own, Admin sees all
router.get('/', protect, async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = {};

    if (req.user.role === 'donor') {
      query.donor = req.user._id;
      if (status) query.status = status;
    } else if (req.user.role === 'ngo') {
      query.status = 'approved';
    } else if (req.user.role === 'admin') {
      if (status) query.status = status;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const medicines = await Medicine.find(query)
      .populate('donor', 'name email')
      .sort({ createdAt: -1 });
    res.json({ medicines });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/medicines/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id).populate('donor', 'name email phone address');
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });
    res.json({ medicine });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/medicines - Donor submits donation
router.post('/', protect, requireRole('donor'), upload.single('image'), async (req, res) => {
  try {
    const { name, quantity, unit, expiryDate, description, category } = req.body;
    if (!name || !quantity || !expiryDate)
      return res.status(400).json({ message: 'Name, quantity and expiry date are required' });

    const expiry = new Date(expiryDate);
    const minExpiry = new Date();
    minExpiry.setDate(minExpiry.getDate() + 30);
    if (expiry < minExpiry)
      return res.status(400).json({ message: 'Medicine must expire at least 30 days from today' });

    const medicine = await Medicine.create({
      name, quantity, unit, expiryDate: expiry,
      description, category,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
      donor: req.user._id,
    });

    const populated = await medicine.populate('donor', 'name email');
    res.status(201).json({ medicine: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/medicines/:id/status - Admin only
router.patch('/:id/status', protect, requireRole('admin'), async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status))
      return res.status(400).json({ message: 'Invalid status' });

    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      { status, adminNote },
      { new: true }
    ).populate('donor', 'name email');

    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });
    res.json({ medicine });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/medicines/:id - Donor (own pending), Admin (any)
router.delete('/:id', protect, async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });

    if (req.user.role === 'donor') {
      if (medicine.donor.toString() !== req.user._id.toString())
        return res.status(403).json({ message: 'Not authorized' });
      if (medicine.status !== 'pending')
        return res.status(400).json({ message: 'Only pending listings can be deleted' });
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await medicine.deleteOne();
    res.json({ message: 'Medicine deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
