const express = require('express');
const profileController = require('../controllers/profile.controller');
const { authenticate } = require('../middleware/auth.middleware');
const multer = require('multer');
const uuid = require('uuid');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

// Multer disk storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!req.user || !req.user.id) {
      return cb(new Error("Unauthorized"), null);
    }
    const userDir = path.join(UPLOAD_DIR, 'satnami-matrimony', 'profiles', req.user.id);
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const uniqueName = `${uuid.v4()}${ext}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// Routes mapping
router.put('/profile', authenticate, profileController.updateProfile);

router.post('/profile/photo', (req, res, next) => {
  authenticate(req, res, (err) => {
    if (err) return res.status(401).json({ detail: "Not authenticated" });
    next();
  });
}, upload.single('file'), profileController.uploadPhoto);

// Secured files wildcard route
router.get('/files/*', profileController.getFile);

router.get('/profiles', profileController.getProfiles);
router.post('/profiles/search', profileController.advancedSearch);
router.get('/profiles/:user_id', authenticate, profileController.getProfileById);
router.get('/views', authenticate, profileController.getProfileViews);

module.exports = router;
