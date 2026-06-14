const express = require('express');
const matchController = require('../controllers/match.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/match/like', authenticate, matchController.likeUser);
router.post('/match/unlike', authenticate, matchController.unlikeUser);
router.post('/match/block', authenticate, matchController.blockUser);
router.post('/match/unblock', authenticate, matchController.unblockUser);
router.get('/match/status/:targetId', authenticate, matchController.getMatchStatus);
router.get('/match/matches', authenticate, matchController.getMatches);
router.get('/match/likes-sent', authenticate, matchController.getLikesSent);
router.get('/match/likes-received', authenticate, matchController.getLikesReceived);

module.exports = router;
