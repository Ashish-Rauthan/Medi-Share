const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');
const { protect, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { handleUpload } = require('../middleware/upload');

// ─── GET /api/medicines ───────────────────────────────────────────────────────
// NGO → approved only | Donor → own listings | Admin → all (with optional status filter)
router.get('/', protect, async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = {};

    if (req.user.role === 'donor') {
      query.donor = req.user._id;
      if (status && ['pending', 'approved', 'rejected'].includes(status)) {
        query.status = status;
      }
    } else if (req.user.role === 'ngo') {
      // Only show approved medicines with quantity > 0
      query.status = 'approved';
      query.quantity = { $gt: 0 };
    } else if (req.user.role === 'admin') {
      if (status && ['pending', 'approved', 'rejected'].includes(status)) {
        query.status = status;
      }
    }

    if (search && search.trim()) {
      // Sanitize: escape regex special characters to prevent ReDoS
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.name = { $regex: escaped, $options: 'i' };
    }

    const medicines = await Medicine.find(query)
      .populate('donor', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ medicines });
  } catch (err) {
    console.error('GET /medicines error:', err);
    res.status(500).json({ message: 'Failed to fetch medicines. Please try again.' });
  }
});

// ─── GET /api/medicines/:id ───────────────────────────────────────────────────
router.get('/:id', protect, async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id)
      .populate('donor', 'name email phone address')
      .lean();

    if (!medicine)
      return res.status(404).json({ message: 'Medicine not found.' });

    // Donors may only view their own medicines
    if (req.user.role === 'donor' && medicine.donor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this medicine.' });
    }

    // NGOs may only view approved medicines
    if (req.user.role === 'ngo' && medicine.status !== 'approved') {
      return res.status(404).json({ message: 'Medicine not found.' });
    }

    res.json({ medicine });
  } catch (err) {
    console.error('GET /medicines/:id error:', err);
    res.status(500).json({ message: 'Failed to fetch medicine details. Please try again.' });
  }
});

// ─── POST /api/medicines ──────────────────────────────────────────────────────
router.post('/', protect, requireRole('donor'), handleUpload('image'), async (req, res) => {
  try {
    const { name, quantity, unit, expiryDate, description, category } = req.body;

    // Validation
    if (!name || !name.trim())
      return res.status(400).json({ message: 'Medicine name is required.' });
    if (!quantity)
      return res.status(400).json({ message: 'Quantity is required.' });

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1)
      return res.status(400).json({ message: 'Quantity must be a positive whole number.' });
    if (qty > 100000)
      return res.status(400).json({ message: 'Quantity is too large. Please double-check.' });

    if (!expiryDate)
      return res.status(400).json({ message: 'Expiry date is required.' });

    const expiry = new Date(expiryDate);
    if (isNaN(expiry.getTime()))
      return res.status(400).json({ message: 'Invalid expiry date format.' });

    const minExpiry = new Date();
    minExpiry.setDate(minExpiry.getDate() + 30);
    if (expiry < minExpiry)
      return res.status(400).json({ message: 'Medicine must expire at least 30 days from today.' });

    if (description && description.length > 500)
      return res.status(400).json({ message: 'Description must be under 500 characters.' });

    const medicine = await Medicine.create({
      name: name.trim(),
      quantity: qty,
      unit: unit || 'tablets',
      expiryDate: expiry,
      description: description?.trim(),
      category: category || 'General',
      imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
      donor: req.user._id,
    });

    const populated = await medicine.populate('donor', 'name email');
    res.status(201).json({ medicine: populated });
  } catch (err) {
    console.error('POST /medicines error:', err);
    res.status(500).json({ message: 'Failed to submit medicine. Please try again.' });
  }
});

// ─── PATCH /api/medicines/:id/status ─────────────────────────────────────────
router.patch('/:id/status', protect, requireRole('admin'), async (req, res) => {
  try {
    const { status, adminNote } = req.body;

    const validStatuses = ['approved', 'rejected', 'pending'];
    if (!status || !validStatuses.includes(status))
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}.` });

    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      { status, adminNote: adminNote?.trim() || undefined },
      { new: true }
    ).populate('donor', 'name email');

    if (!medicine)
      return res.status(404).json({ message: 'Medicine not found.' });

    res.json({ medicine });
  } catch (err) {
    console.error('PATCH /medicines/:id/status error:', err);
    res.status(500).json({ message: 'Failed to update medicine status. Please try again.' });
  }
});

// ─── DELETE /api/medicines/:id ────────────────────────────────────────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine)
      return res.status(404).json({ message: 'Medicine not found.' });

    if (req.user.role === 'donor') {
      if (medicine.donor.toString() !== req.user._id.toString())
        return res.status(403).json({ message: 'You are not authorized to delete this listing.' });
      if (medicine.status !== 'pending')
        return res.status(400).json({ message: 'Only pending listings can be deleted.' });
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    await medicine.deleteOne();
    res.json({ message: 'Medicine listing deleted successfully.' });
  } catch (err) {
    console.error('DELETE /medicines/:id error:', err);
    res.status(500).json({ message: 'Failed to delete medicine. Please try again.' });
  }
});

module.exports = router;
