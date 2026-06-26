const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const Medicine = require('../models/Medicine');
const { protect, requireRole } = require('../middleware/auth');

// ─── GET /api/requests ────────────────────────────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'ngo') {
      query.ngo = req.user._id;
    } else if (req.user.role === 'donor') {
      const medicines = await Medicine.find({ donor: req.user._id }).select('_id').lean();
      if (medicines.length === 0) return res.json({ requests: [] });
      query.medicine = { $in: medicines.map(m => m._id) };
    }
    // admin: no filter — sees all

    const requests = await Request.find(query)
      .populate({ path: 'medicine', populate: { path: 'donor', select: 'name email' } })
      .populate('ngo', 'name email organizationName')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ requests });
  } catch (err) {
    console.error('GET /requests error:', err);
    res.status(500).json({ message: 'Failed to fetch requests. Please try again.' });
  }
});

// ─── POST /api/requests ───────────────────────────────────────────────────────
router.post('/', protect, requireRole('ngo'), async (req, res) => {
  try {
    // Guard: NGO must be approved before requesting
    if (!req.user.isApproved) {
      return res.status(403).json({
        message: 'Your NGO account is pending admin approval. You cannot submit requests yet.',
      });
    }

    const { medicineId, quantityRequested, purpose } = req.body;

    if (!medicineId)
      return res.status(400).json({ message: 'Medicine ID is required.' });

    const qty = parseInt(quantityRequested, 10);
    if (!quantityRequested || isNaN(qty) || qty < 1)
      return res.status(400).json({ message: 'Quantity must be a positive whole number.' });

    if (!purpose || !purpose.trim())
      return res.status(400).json({ message: 'Purpose is required.' });
    if (purpose.trim().length < 20)
      return res.status(400).json({ message: 'Please provide a more detailed purpose (at least 20 characters).' });
    if (purpose.trim().length > 500)
      return res.status(400).json({ message: 'Purpose must be under 500 characters.' });

    const medicine = await Medicine.findById(medicineId);
    if (!medicine)
      return res.status(404).json({ message: 'Medicine not found.' });
    if (medicine.status !== 'approved')
      return res.status(400).json({ message: 'This medicine is not available for requests.' });
    if (medicine.quantity < 1)
      return res.status(400).json({ message: 'This medicine is out of stock.' });
    if (qty > medicine.quantity)
      return res.status(400).json({ message: `Only ${medicine.quantity} ${medicine.unit} available.` });

    // Check for duplicate active request
    const existing = await Request.findOne({
      medicine: medicineId,
      ngo: req.user._id,
      status: { $in: ['submitted', 'under_review', 'approved', 'allocated'] },
    });
    if (existing) {
      return res.status(409).json({
        message: 'You already have an active request for this medicine. Please wait for it to be processed.',
      });
    }

    const request = await Request.create({
      medicine: medicineId,
      ngo: req.user._id,
      quantityRequested: qty,
      purpose: purpose.trim(),
    });

    const populated = await Request.findById(request._id)
      .populate('medicine', 'name quantity unit')
      .populate('ngo', 'name email organizationName');

    res.status(201).json({ request: populated });
  } catch (err) {
    console.error('POST /requests error:', err);
    res.status(500).json({ message: 'Failed to submit request. Please try again.' });
  }
});

// ─── PATCH /api/requests/:id/status ──────────────────────────────────────────
router.patch('/:id/status', protect, requireRole('admin'), async (req, res) => {
  try {
    const { status, adminNote } = req.body;

    const validStatuses = ['under_review', 'approved', 'rejected', 'allocated', 'completed'];
    if (!status || !validStatuses.includes(status))
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}.` });

    const request = await Request.findById(req.params.id).populate('medicine');
    if (!request)
      return res.status(404).json({ message: 'Request not found.' });

    // Guard: prevent nonsensical status transitions
    const TRANSITIONS = {
      submitted:    ['under_review', 'rejected'],
      under_review: ['approved', 'rejected'],
      approved:     ['allocated', 'rejected'],
      allocated:    ['completed'],
      completed:    [],
      rejected:     [],
    };
    const allowed = TRANSITIONS[request.status] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        message: `Cannot transition from "${request.status}" to "${status}".`,
      });
    }

    const prevStatus = request.status;
    request.status = status;
    if (adminNote !== undefined) request.adminNote = adminNote.trim() || undefined;

    // Deduct inventory when allocated or completed (only once)
    if (
      (status === 'allocated' || status === 'completed') &&
      prevStatus !== 'allocated' && prevStatus !== 'completed'
    ) {
      const medicine = await Medicine.findById(request.medicine._id);
      if (medicine) {
        if (medicine.quantity < request.quantityRequested) {
          return res.status(400).json({
            message: `Insufficient stock. Only ${medicine.quantity} ${medicine.unit} remaining.`,
          });
        }
        medicine.quantity = Math.max(0, medicine.quantity - request.quantityRequested);
        await medicine.save();
      }
    }

    // Restore inventory if rejected after allocation
    if (status === 'rejected' && (prevStatus === 'allocated' || prevStatus === 'completed')) {
      const medicine = await Medicine.findById(request.medicine._id);
      if (medicine) {
        medicine.quantity += request.quantityRequested;
        await medicine.save();
      }
    }

    await request.save();

    const populated = await Request.findById(request._id)
      .populate({ path: 'medicine', populate: { path: 'donor', select: 'name email' } })
      .populate('ngo', 'name email organizationName');

    res.json({ request: populated });
  } catch (err) {
    console.error('PATCH /requests/:id/status error:', err);
    res.status(500).json({ message: 'Failed to update request. Please try again.' });
  }
});

module.exports = router;
