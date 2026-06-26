const express = require('express');
const { sendContactEmail } = require('../utils/mailer');

const router = express.Router();

// Basic HTML-escape to prevent injected content in email templates
const escapeHtml = (str) =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

// POST /api/contact
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body || {};

    // Validation
    if (!name || !name.trim())
      return res.status(400).json({ message: 'Name is required.' });
    if (!email || !email.trim())
      return res.status(400).json({ message: 'Email address is required.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    if (!subject || !subject.trim())
      return res.status(400).json({ message: 'Subject is required.' });
    if (!message || !message.trim())
      return res.status(400).json({ message: 'Message is required.' });
    if (message.trim().length < 10)
      return res.status(400).json({ message: 'Message must be at least 10 characters.' });
    if (message.trim().length > 2000)
      return res.status(400).json({ message: 'Message must be under 2000 characters.' });

    await sendContactEmail({
      name: escapeHtml(name.trim()),
      email: email.trim().toLowerCase(),
      subject: escapeHtml(subject.trim()),
      message: escapeHtml(message.trim()),
    });

    return res.status(200).json({ message: 'Your message was sent successfully.' });
  } catch (error) {
    console.error('Contact form email failed:', error.message);
    return res.status(500).json({ message: 'Unable to send your message right now. Please try again later.' });
  }
});

module.exports = router;
