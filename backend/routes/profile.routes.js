const express = require('express');
const profileController = require('../controllers/profile.controller');
const { authenticate } = require('../middleware/auth.middleware');
const multer = require('multer');
const multerS3 = require('multer-s3');
const uuid = require('uuid');
const path = require('path');
const { s3Client, S3_BUCKET } = require('../config/s3');

const router = express.Router();

// Multer-S3 storage — uploads directly to AWS S3
const storage = multerS3({
  s3: s3Client,
  bucket: S3_BUCKET,
  // Set content type from the file's own mimetype (more reliable than AUTO_CONTENT_TYPE)
  contentType: (req, file, cb) => {
    cb(null, file.mimetype);
  },
  key: (req, file, cb) => {
    if (!req.user || !req.user.id) {
      return cb(new Error("Unauthorized"));
    }
    const ext = path.extname(file.originalname) || '.jpg';
    const uniqueName = `${uuid.v4()}${ext}`;
    // S3 key: profiles/{userId}/{uuid}.ext
    const key = `profiles/${req.user.id}/${uniqueName}`;
    cb(null, key);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    if (allowed.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, webp, gif)'));
    }
  }
});

// Routes mapping
router.put('/profile', authenticate, profileController.updateProfile);
router.delete('/profile', authenticate, profileController.deleteProfile);

router.post('/profile/photo', (req, res, next) => {
  authenticate(req, res, (err) => {
    if (err) return res.status(401).json({ detail: "Not authenticated" });
    next();
  });
}, (req, res, next) => {
  // Run multer and catch any errors (S3 errors, file size, type, etc.)
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error('[S3 Upload Error]', err.message, err.code || '', err.stack || '');
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ detail: 'File too large. Maximum size is 5MB.' });
      }
      return res.status(500).json({
        detail: 'Upload failed',
        error: err.message,
        code: err.code || null
      });
    }
    next();
  });
}, profileController.uploadPhoto);

// Note: /files/* route is no longer needed (S3 serves files directly),
// but kept for backward compatibility with any existing local file references.
router.get('/files/*', profileController.getFile);

router.get('/profiles', profileController.getProfiles);
router.post('/profiles/search', profileController.advancedSearch);
router.get('/profiles/:user_id', authenticate, profileController.getProfileById);
router.get('/views', authenticate, profileController.getProfileViews);

module.exports = router;
