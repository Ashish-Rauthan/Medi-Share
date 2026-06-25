const express = require('express');
const { sendContactEmail } = require('../utils/mailer');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body || {};

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'Please fill in all contact fields.' });
    }

    await sendContactEmail({ name, email, subject, message });

    return res.status(200).json({ message: 'Your message was sent successfully.' });
  } catch (error) {
    console.error('Contact form email failed:', error.message);
    return res.status(500).json({ message: 'Unable to send your message right now. Please try again later.' });
  }
});

module.exports = router;
