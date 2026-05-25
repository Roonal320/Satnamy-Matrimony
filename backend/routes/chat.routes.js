const express = require('express');
const chatController = require('../controllers/chat.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/messages', authenticate, chatController.sendMessage);
router.get('/messages/:other_user_id', authenticate, chatController.getMessages);
router.get('/conversations', authenticate, chatController.getConversations);

module.exports = router;
