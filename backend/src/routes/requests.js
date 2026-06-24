const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const Medicine = require('../models/Medicine');
const { protect, requireRole } = require('../middleware/auth');

// GET /api/requests
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'ngo') query.ngo = req.user._id;
    if (req.user.role === 'donor') {
      const medicines = await Medicine.find({ donor: req.user._id }).select('_id');
      query.medicine = { $in: medicines.map(m => m._id) };
    }

    const requests = await Request.find(query)
      .populate({ path: 'medicine', populate: { path: 'donor', select: 'name email' } })
      .populate('ngo', 'name email organizationName')
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/requests — NGO submits request
router.post('/', protect, requireRole('ngo'), async (req, res) => {
  try {
    const { medicineId, quantityRequested, purpose } = req.body;
    if (!medicineId || !quantityRequested || !purpose)
      return res.status(400).json({ message: 'Medicine, quantity and purpose are required' });

    const medicine = await Medicine.findById(medicineId);
    if (!medicine || medicine.status !== 'approved')
      return res.status(400).json({ message: 'Medicine not found or not available' });
    if (quantityRequested > medicine.quantity)
      return res.status(400).json({ message: `Only ${medicine.quantity} ${medicine.unit} available` });

    const existing = await Request.findOne({
      medicine: medicineId,
      ngo: req.user._id,
      status: { $in: ['submitted', 'under_review', 'approved', 'allocated'] }
    });
    if (existing)
      return res.status(409).json({ message: 'You already have an active request for this medicine' });

    const request = await Request.create({
      medicine: medicineId,
      ngo: req.user._id,
      quantityRequested,
      purpose,
    });

    const populated = await Request.findById(request._id)
      .populate('medicine', 'name quantity unit')
      .populate('ngo', 'name email organizationName');

    res.status(201).json({ request: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/requests/:id/status — Admin only
router.patch('/:id/status', protect, requireRole('admin'), async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const validStatuses = ['under_review', 'approved', 'rejected', 'allocated', 'completed'];
    if (!validStatuses.includes(status))
      return res.status(400).json({ message: 'Invalid status' });

    const request = await Request.findById(req.params.id).populate('medicine');
    if (!request) return res.status(404).json({ message: 'Request not found' });

    const prevStatus = request.status;
    request.status = status;
    request.adminNote = adminNote;

    // When marked as allocated or completed — deduct inventory
    if ((status === 'allocated' || status === 'completed') &&
        prevStatus !== 'allocated' && prevStatus !== 'completed') {
      const medicine = await Medicine.findById(request.medicine._id);
      if (medicine) {
        medicine.quantity = Math.max(0, medicine.quantity - request.quantityRequested);
        // If quantity hits 0, mark as exhausted (keep approved but qty=0)
        await medicine.save();
      }
    }

    // If rejected after allocation — restore inventory
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
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;