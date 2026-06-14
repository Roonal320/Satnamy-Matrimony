const Match = require('../models/Match');
const User = require('../models/User');

/**
 * Like a user. If the target has already liked this user, it's a mutual match.
 */
async function likeUser(req, res) {
  try {
    const userId = req.user.id;
    const { target_id } = req.body;

    if (!target_id) {
      return res.status(422).json({ detail: "Missing target_id" });
    }
    if (target_id === userId) {
      return res.status(400).json({ detail: "Cannot like yourself" });
    }

    // Check if target user exists
    const targetUser = await User.findOne({ id: target_id }, { id: 1, name: 1, profile_photo: 1, _id: 0 });
    if (!targetUser) {
      return res.status(404).json({ detail: "User not found" });
    }

    // Check if we've blocked them or they've blocked us
    const blockExists = await Match.findOne({
      $or: [
        { user_id: userId, target_id: target_id, type: 'block' },
        { user_id: target_id, target_id: userId, type: 'block' }
      ]
    });
    if (blockExists) {
      return res.status(400).json({ detail: "Cannot like a blocked user" });
    }

    // Upsert the like (replace any existing record)
    await Match.findOneAndUpdate(
      { user_id: userId, target_id: target_id },
      { $set: { type: 'like', created_at: new Date().toISOString() } },
      { upsert: true, new: true }
    );

    // Check if there's a reciprocal like → mutual match
    const reciprocal = await Match.findOne({
      user_id: target_id,
      target_id: userId,
      type: 'like'
    });

    const isMutualMatch = !!reciprocal;

    // If it's a new mutual match, notify both users via Socket.io
    if (isMutualMatch) {
      const io = req.app.get('io');
      if (io) {
        const currentUser = await User.findOne(
          { id: userId },
          { id: 1, name: 1, profile_photo: 1, _id: 0 }
        );
        io.to(target_id).emit('match_notification', {
          matchedUser: currentUser ? currentUser.toObject() : { id: userId },
          message: "It's a match! 🎉"
        });
        io.to(userId).emit('match_notification', {
          matchedUser: targetUser.toObject(),
          message: "It's a match! 🎉"
        });
      }
    }

    return res.status(200).json({
      success: true,
      is_mutual_match: isMutualMatch,
      target_id
    });
  } catch (err) {
    // Handle duplicate key error gracefully
    if (err.code === 11000) {
      return res.status(200).json({ success: true, detail: "Already liked" });
    }
    console.error('likeUser error:', err);
    return res.status(500).json({ detail: "Internal server error" });
  }
}

/**
 * Unlike / unmatch a user.
 */
async function unlikeUser(req, res) {
  try {
    const userId = req.user.id;
    const { target_id } = req.body;

    if (!target_id) {
      return res.status(422).json({ detail: "Missing target_id" });
    }

    await Match.deleteOne({ user_id: userId, target_id: target_id, type: 'like' });

    return res.status(200).json({ success: true, target_id });
  } catch (err) {
    console.error('unlikeUser error:', err);
    return res.status(500).json({ detail: "Internal server error" });
  }
}

/**
 * Block a user. Also removes any existing likes between both users.
 */
async function blockUser(req, res) {
  try {
    const userId = req.user.id;
    const { target_id } = req.body;

    if (!target_id) {
      return res.status(422).json({ detail: "Missing target_id" });
    }
    if (target_id === userId) {
      return res.status(400).json({ detail: "Cannot block yourself" });
    }

    // Remove any existing likes in both directions
    await Match.deleteMany({
      $or: [
        { user_id: userId, target_id: target_id, type: 'like' },
        { user_id: target_id, target_id: userId, type: 'like' }
      ]
    });

    // Create the block record
    await Match.findOneAndUpdate(
      { user_id: userId, target_id: target_id },
      { $set: { type: 'block', created_at: new Date().toISOString() } },
      { upsert: true, new: true }
    );

    return res.status(200).json({ success: true, target_id });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(200).json({ success: true, detail: "Already blocked" });
    }
    console.error('blockUser error:', err);
    return res.status(500).json({ detail: "Internal server error" });
  }
}

/**
 * Unblock a user.
 */
async function unblockUser(req, res) {
  try {
    const userId = req.user.id;
    const { target_id } = req.body;

    if (!target_id) {
      return res.status(422).json({ detail: "Missing target_id" });
    }

    await Match.deleteOne({ user_id: userId, target_id: target_id, type: 'block' });

    return res.status(200).json({ success: true, target_id });
  } catch (err) {
    console.error('unblockUser error:', err);
    return res.status(500).json({ detail: "Internal server error" });
  }
}

/**
 * Get the match status between the current user and a target user.
 */
async function getMatchStatus(req, res) {
  try {
    const userId = req.user.id;
    const targetId = req.params.targetId;

    if (!targetId) {
      return res.status(422).json({ detail: "Missing targetId" });
    }

    const [myRecord, theirRecord] = await Promise.all([
      Match.findOne({ user_id: userId, target_id: targetId }),
      Match.findOne({ user_id: targetId, target_id: userId })
    ]);

    const liked_by_me = myRecord?.type === 'like';
    const liked_by_them = theirRecord?.type === 'like';
    const blocked_by_me = myRecord?.type === 'block';
    const blocked_by_them = theirRecord?.type === 'block';
    const is_mutual_match = liked_by_me && liked_by_them;

    return res.status(200).json({
      liked_by_me,
      liked_by_them,
      is_mutual_match,
      blocked_by_me,
      blocked_by_them
    });
  } catch (err) {
    console.error('getMatchStatus error:', err);
    return res.status(500).json({ detail: "Internal server error" });
  }
}

/**
 * Get all mutual matches for the current user.
 */
async function getMatches(req, res) {
  try {
    const userId = req.user.id;

    // Find all users I liked
    const myLikes = await Match.find({ user_id: userId, type: 'like' });
    const myLikedIds = myLikes.map(m => m.target_id);

    if (myLikedIds.length === 0) {
      return res.status(200).json([]);
    }

    // Find which of those also liked me back → mutual match
    const reciprocals = await Match.find({
      user_id: { $in: myLikedIds },
      target_id: userId,
      type: 'like'
    });
    const matchedIds = reciprocals.map(m => m.user_id);

    if (matchedIds.length === 0) {
      return res.status(200).json([]);
    }

    // Fetch profile info for matched users
    const matchedUsers = await User.find(
      { id: { $in: matchedIds } },
      { password_hash: 0, _id: 0, email: 0, phone: 0 }
    );

    const result = matchedUsers.map(u => {
      const obj = u.toObject();
      const isPremium = obj.is_premium && obj.premium_until && new Date(obj.premium_until) > new Date();
      obj.is_premium = isPremium;
      obj.premium_plan = isPremium ? obj.premium_plan : null;
      obj.premium_name = isPremium ? obj.premium_name : null;
      obj.premium_until = isPremium ? obj.premium_until : null;
      obj.premium_features = isPremium ? obj.premium_features : [];
      return obj;
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error('getMatches error:', err);
    return res.status(500).json({ detail: "Internal server error" });
  }
}

/**
 * Get users I liked (pending — not yet mutual).
 */
async function getLikesSent(req, res) {
  try {
    const userId = req.user.id;
    const myLikes = await Match.find({ user_id: userId, type: 'like' });
    const likedIds = myLikes.map(m => m.target_id);

    if (likedIds.length === 0) return res.status(200).json([]);

    // Filter out mutual matches — only show pending
    const reciprocals = await Match.find({
      user_id: { $in: likedIds },
      target_id: userId,
      type: 'like'
    });
    const mutualIds = new Set(reciprocals.map(m => m.user_id));
    const pendingIds = likedIds.filter(id => !mutualIds.has(id));

    if (pendingIds.length === 0) return res.status(200).json([]);

    const users = await User.find(
      { id: { $in: pendingIds } },
      { id: 1, name: 1, profile_photo: 1, city: 1, state: 1, date_of_birth: 1, occupation: 1, education: 1, _id: 0 }
    );

    return res.status(200).json(users.map(u => u.toObject()));
  } catch (err) {
    console.error('getLikesSent error:', err);
    return res.status(500).json({ detail: "Internal server error" });
  }
}

/**
 * Get users who liked me (I haven't liked them back yet).
 */
async function getLikesReceived(req, res) {
  try {
    const userId = req.user.id;
    const theirLikes = await Match.find({ target_id: userId, type: 'like' });
    const likerIds = theirLikes.map(m => m.user_id);

    if (likerIds.length === 0) return res.status(200).json([]);

    // Filter out users I already liked back (mutual matches)
    const myLikes = await Match.find({
      user_id: userId,
      target_id: { $in: likerIds },
      type: 'like'
    });
    const iLikedBack = new Set(myLikes.map(m => m.target_id));
    const pendingIds = likerIds.filter(id => !iLikedBack.has(id));

    if (pendingIds.length === 0) return res.status(200).json([]);

    const users = await User.find(
      { id: { $in: pendingIds } },
      { id: 1, name: 1, profile_photo: 1, city: 1, state: 1, date_of_birth: 1, occupation: 1, education: 1, _id: 0 }
    );

    return res.status(200).json(users.map(u => u.toObject()));
  } catch (err) {
    console.error('getLikesReceived error:', err);
    return res.status(500).json({ detail: "Internal server error" });
  }
}

/**
 * Helper: check if two users are mutual matches.
 * Used by chat controller to gate messaging.
 */
async function areMutualMatches(userId1, userId2) {
  const [like1, like2] = await Promise.all([
    Match.findOne({ user_id: userId1, target_id: userId2, type: 'like' }),
    Match.findOne({ user_id: userId2, target_id: userId1, type: 'like' })
  ]);
  return !!(like1 && like2);
}

/**
 * Helper: check if either user has blocked the other.
 */
async function isBlocked(userId1, userId2) {
  const block = await Match.findOne({
    $or: [
      { user_id: userId1, target_id: userId2, type: 'block' },
      { user_id: userId2, target_id: userId1, type: 'block' }
    ]
  });
  return !!block;
}

module.exports = {
  likeUser,
  unlikeUser,
  blockUser,
  unblockUser,
  getMatchStatus,
  getMatches,
  getLikesSent,
  getLikesReceived,
  areMutualMatches,
  isBlocked
};
