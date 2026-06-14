const express = require('express');
const chatController = require('../controllers/chat.controller');
const { authenticate } = require('../middleware/auth.middleware');
const multer = require('multer');
const multerS3 = require('multer-s3');
const uuid = require('uuid');
const path = require('path');
const { s3Client, S3_BUCKET, getS3Url } = require('../config/s3');

const router = express.Router();

// Multer-S3 storage configuration for Chat Attachments
const storage = multerS3({
  s3: s3Client,
  bucket: S3_BUCKET,
  contentType: (req, file, cb) => {
    cb(null, file.mimetype);
  },
  key: (req, file, cb) => {
    if (!req.user || !req.user.id) {
      return cb(new Error("Unauthorized"));
    }
    const ext = path.extname(file.originalname) || '.jpg';
    const uniqueName = `${uuid.v4()}${ext}`;
    const key = `chat/${req.user.id}/${uniqueName}`;
    cb(null, key);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
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

router.post('/messages', authenticate, chatController.sendMessage);
router.post('/messages/upload-photo', authenticate, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error('[Chat S3 Upload Error]', err.message);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ detail: 'File too large. Maximum size is 10MB.' });
      }
      return res.status(500).json({
        detail: 'Upload failed',
        error: err.message
      });
    }
    next();
  });
}, (req, res) => {
  if (!req.file) {
    return res.status(400).json({ detail: "No file uploaded" });
  }
  const photoUrl = req.file.location || getS3Url(req.file.key);
  return res.status(200).json({ url: photoUrl });
});

router.get('/messages/:other_user_id', authenticate, chatController.getMessages);
router.put('/messages/:id', authenticate, chatController.editMessage);
router.delete('/messages/:id', authenticate, chatController.deleteMessage);
router.get('/conversations', authenticate, chatController.getConversations);

module.exports = router;
