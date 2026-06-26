const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized. Please log in.' });
    }

    const token = auth.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
      if (jwtErr.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Your session has expired. Please log in again.' });
      }
      return res.status(401).json({ message: 'Invalid token. Please log in again.' });
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Account not found. Please log in again.' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ message: 'Authentication error. Please try again.' });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      message: `Access denied. This action requires one of the following roles: ${roles.join(', ')}.`,
    });
  }
  next();
};

module.exports = { protect, requireRole };
