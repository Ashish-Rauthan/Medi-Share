const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../utils/cloudinary');
const path = require('path');

const ALLOWED_MIME = /^image\/(jpeg|jpg|png|webp)$/;
const ALLOWED_EXT  = /\.(jpeg|jpg|png|webp)$/i;

// ─── Cloudinary storage engine ────────────────────────────────────────────────
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:          'medishare/medicines',
    allowed_formats: ['jpeg', 'jpg', 'png', 'webp'],
    transformation: [
      { width: 800, height: 600, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
    ],
    public_id: (req, file) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      return `medicine-${unique}`;
    },
  },
});

// ─── File filter ──────────────────────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  if (ALLOWED_EXT.test(path.extname(file.originalname)) && ALLOWED_MIME.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, or WebP images are allowed.'));
  }
};

// ─── Multer instance ──────────────────────────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// ─── Middleware wrapper ───────────────────────────────────────────────────────
const handleUpload = (fieldName) => (req, res, next) => {
  upload.single(fieldName)(req, res, (err) => {
    if (!err) {
      if (req.file) {
        console.log('✅ Cloudinary upload success:', {
          path:     req.file.path,
          filename: req.file.filename,
          size:     req.file.size,
        });
      } else {
        console.log('ℹ️  No file uploaded (optional field)');
      }
      return next();
    }

    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'Image file must be under 5 MB.' });
      }
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    }
    console.error('❌ Upload error:', err.message);
    return res.status(400).json({ message: err.message || 'File upload failed.' });
  });
};

module.exports = upload;
module.exports.handleUpload = handleUpload;