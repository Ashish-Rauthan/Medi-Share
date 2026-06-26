const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, unique + path.extname(file.originalname).toLowerCase());
  },
});

const ALLOWED_MIME = /^image\/(jpeg|jpg|png|webp)$/;
const ALLOWED_EXT  = /\.(jpeg|jpg|png|webp)$/i;

const fileFilter = (req, file, cb) => {
  if (ALLOWED_EXT.test(path.extname(file.originalname)) && ALLOWED_MIME.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, or WebP images are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

/**
 * Wraps multer to return a clean JSON error instead of crashing.
 * Usage: router.post('/', handleUpload('image'), handler)
 */
const handleUpload = (fieldName) => (req, res, next) => {
  upload.single(fieldName)(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'Image file must be under 5 MB.' });
      }
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    }
    // Custom fileFilter error
    return res.status(400).json({ message: err.message || 'File upload failed.' });
  });
};

module.exports = upload;
module.exports.handleUpload = handleUpload;
