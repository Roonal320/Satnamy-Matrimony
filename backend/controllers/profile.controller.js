const User = require('../models/User');
const View = require('../models/View');
const Message = require('../models/Message');
const Match = require('../models/Match');
const profileService = require('../services/profile.service');
const authService = require('../services/auth.service');
const path = require('path');
const fs = require('fs');
const { getS3Url, getS3KeyFromUrl, deleteFromS3 } = require('../config/s3');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret123';
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

/**
 * Update current user profile fields.
 */
async function updateProfile(req, res) {
  try {
    const updateData = {};
    const allowedFields = [
      'height', 'weight', 'marital_status', 'religion', 'caste',
      'mother_tongue', 'education', 'occupation', 'income',
      'city', 'state', 'country', 'about', 'family_type',
      'father_occupation', 'mother_occupation', 'siblings'
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined && req.body[field] !== null) {
        updateData[field] = req.body[field];
      }
    }

    if (Object.keys(updateData).length > 0) {
      updateData.profile_completed = true;
      await User.updateOne({ id: req.user.id }, { $set: updateData });
    }

    const updatedUser = await User.findOne({ id: req.user.id });
    const userObj = updatedUser.toObject();
    delete userObj.password_hash;
    delete userObj._id;
    const isPremium = userObj.is_premium && userObj.premium_until && new Date(userObj.premium_until) > new Date();
    userObj.is_premium = isPremium;
    userObj.premium_plan = isPremium ? userObj.premium_plan : null;
    userObj.premium_name = isPremium ? userObj.premium_name : null;
    userObj.premium_until = isPremium ? userObj.premium_until : null;
    userObj.premium_features = isPremium ? userObj.premium_features : [];
    return res.status(200).json(userObj);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ detail: "Internal server error" });
  }
}

/**
 * Handle user profile image uploads.
 * Files are stored in AWS S3 via multer-s3.
 * req.file.location  — the public S3 URL (set automatically by multer-s3)
 * req.file.key       — the S3 object key (e.g. profiles/{userId}/{uuid}.jpg)
 */
async function uploadPhoto(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ detail: "No file uploaded" });
    }

    // Retrieve current user to find old profile photo
    const currentUser = await User.findOne({ id: req.user.id });
    if (currentUser && currentUser.profile_photo) {
      const oldKey = getS3KeyFromUrl(currentUser.profile_photo);
      if (oldKey) {
        // Fire-and-forget delete of old S3 object
        deleteFromS3(oldKey);
      }
    }

    // multer-s3 sets req.file.location to the full public S3 URL
    const photoUrl = req.file.location || getS3Url(req.file.key);

    await User.updateOne({ id: req.user.id }, { $set: { profile_photo: photoUrl } });

    return res.status(200).json({
      url: photoUrl,
      key: req.file.key,
      message: "Photo uploaded successfully to S3"
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ detail: "Internal server error" });
  }
}

/**
 * Securely serve uploaded files (local disk — kept for backward compatibility).
 * New uploads go directly to S3 and are served via public S3 URLs.
 */
async function getFile(req, res) {
  const filePath = req.params[0];
  let token = req.cookies.access_token;
  if (!token && req.query.auth) {
    token = req.query.auth;
  }
  if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.slice(7);
  }

  if (!token) {
    return res.status(401).json({ detail: "Not authenticated" });
  }

  try {
    const decoded = authService.verifyToken(token);
    if (decoded.type !== 'access') {
      return res.status(401).json({ detail: "Invalid token" });
    }
  } catch (err) {
    return res.status(401).json({ detail: "Invalid token" });
  }

  try {
    const fullPath = path.join(UPLOAD_DIR, filePath);
    const resolvedPath = path.resolve(fullPath);
    const resolvedUploadsDir = path.resolve(UPLOAD_DIR);

    // Directory traversal guard
    if (!resolvedPath.startsWith(resolvedUploadsDir)) {
      return res.status(403).json({ detail: "Access denied" });
    }

    if (!fs.existsSync(resolvedPath)) {
      return res.status(404).json({ detail: "File not found" });
    }

    const ext = path.extname(resolvedPath).toLowerCase();
    const contentTypes = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
      ".gif": "image/gif"
    };
    const contentType = contentTypes[ext] || "application/octet-stream";

    res.setHeader('Content-Type', contentType);
    fs.createReadStream(resolvedPath).pipe(res);
  } catch (err) {
    console.error(`File fetch error: ${err.message}`);
    return res.status(404).json({ detail: "File not found" });
  }
}

/**
 * List opposite-gender matching profiles (or all if public request).
 */
async function getProfiles(req, res) {
  try {
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 20;

    let userObj = null;
    let query = { profile_completed: true };
    let blockedUserIds = [];

    let token = req.cookies.access_token;
    if (!token) {
      const authHeader = req.headers.authorization || "";
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.slice(7);
      }
    }

    if (token) {
      try {
        const decoded = authService.verifyToken(token);
        if (decoded.type === "access") {
          const user = await User.findOne({ id: decoded.sub });
          if (user) {
            userObj = user.toObject();
            const blocks = await Match.find({
              $or: [
                { user_id: userObj.id, type: 'block' },
                { target_id: userObj.id, type: 'block' }
              ]
            });
            blockedUserIds = blocks.map(b => b.user_id === userObj.id ? b.target_id : b.user_id);
            query.id = { $nin: [userObj.id, ...blockedUserIds] };
            if (userObj.gender) {
              query.gender = userObj.gender === "Male" ? "Female" : "Male";
            }
          }
        }
      } catch (e) {
        // Treat as public access
      }
    }

    const profiles = await User.find(query, { password_hash: 0, _id: 0, email: 0, phone: 0 });
    const profilesList = profiles.map(p => {
      const pObj = p.toObject();
      const isPremium = pObj.is_premium && pObj.premium_until && new Date(pObj.premium_until) > new Date();
      pObj.is_premium = isPremium;
      pObj.premium_plan = isPremium ? pObj.premium_plan : null;
      pObj.premium_name = isPremium ? pObj.premium_name : null;
      pObj.premium_until = isPremium ? pObj.premium_until : null;
      pObj.premium_features = isPremium ? pObj.premium_features : [];
      return pObj;
    });

    // Sort matching profiles
    profilesList.sort((a, b) => {
      const scoreA = profileService.calculateMatchScore(a, userObj);
      const scoreB = profileService.calculateMatchScore(b, userObj);
      return scoreB - scoreA;
    });

    const paginated = profilesList.slice(skip, skip + limit);
    return res.status(200).json(paginated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ detail: "Internal server error" });
  }
}

/**
 * Advanced profiles search endpoint.
 */
async function advancedSearch(req, res) {
  try {
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 20;
    const filters = req.body || {};

    const query = { profile_completed: true };
    let blockedUserIds = [];

    let token = req.cookies.access_token;
    if (!token) {
      const authHeader = req.headers.authorization || "";
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.slice(7);
      }
    }

    if (token) {
      try {
        const decoded = authService.verifyToken(token);
        if (decoded.type === "access") {
          const currentUserId = decoded.sub;
          const blocks = await Match.find({
            $or: [
              { user_id: currentUserId, type: 'block' },
              { target_id: currentUserId, type: 'block' }
            ]
          });
          blockedUserIds = blocks.map(b => b.user_id === currentUserId ? b.target_id : b.user_id);
          query.id = { $nin: [currentUserId, ...blockedUserIds] };
        }
      } catch (e) {
        // Ignore token issues
      }
    }

    if (filters.gender) query.gender = filters.gender;
    if (filters.marital_status) query.marital_status = filters.marital_status;
    if (filters.religion) query.religion = filters.religion;
    if (filters.caste) query.caste = filters.caste;
    if (filters.education) query.education = filters.education;
    if (filters.city) query.city = { $regex: filters.city, $options: 'i' };
    if (filters.state) query.state = { $regex: filters.state, $options: 'i' };
    if (filters.income) query.income = filters.income;

    const profiles = await User.find(query, { password_hash: 0, _id: 0, email: 0, phone: 0 })
      .skip(skip)
      .limit(limit);

    const profilesList = profiles.map(p => {
      const pObj = p.toObject();
      const isPremium = pObj.is_premium && pObj.premium_until && new Date(pObj.premium_until) > new Date();
      pObj.is_premium = isPremium;
      pObj.premium_plan = isPremium ? pObj.premium_plan : null;
      pObj.premium_name = isPremium ? pObj.premium_name : null;
      pObj.premium_until = isPremium ? pObj.premium_until : null;
      pObj.premium_features = isPremium ? pObj.premium_features : [];
      return pObj;
    });

    // Sort by plan priority
    profilesList.sort((a, b) => {
      return profileService.getPlanPriority(b) - profileService.getPlanPriority(a);
    });

    return res.status(200).json(profilesList);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ detail: "Internal server error" });
  }
}

/**
 * Retrieve profile details by user_id.
 */
async function getProfileById(req, res) {
  try {
    const userId = req.params.user_id;
    const currentUser = req.user;

    // Check if blocked
    const block = await Match.findOne({
      $or: [
        { user_id: currentUser.id, target_id: userId, type: 'block' },
        { user_id: userId, target_id: currentUser.id, type: 'block' }
      ]
    });
    if (block) {
      return res.status(403).json({ detail: "Profile not found or unavailable" });
    }

    const profile = await User.findOne({ id: userId });
    if (!profile) {
      return res.status(404).json({ detail: "Profile not found" });
    }

    const profileObj = profile.toObject();
    delete profileObj.password_hash;
    delete profileObj._id;
    const isPremium = profileObj.is_premium && profileObj.premium_until && new Date(profileObj.premium_until) > new Date();
    profileObj.is_premium = isPremium;
    profileObj.premium_plan = isPremium ? profileObj.premium_plan : null;
    profileObj.premium_name = isPremium ? profileObj.premium_name : null;
    profileObj.premium_until = isPremium ? profileObj.premium_until : null;
    profileObj.premium_features = isPremium ? profileObj.premium_features : [];

    // Fetch match status
    const [myRecord, theirRecord] = await Promise.all([
      Match.findOne({ user_id: currentUser.id, target_id: userId }),
      Match.findOne({ user_id: userId, target_id: currentUser.id })
    ]);
    profileObj.liked_by_me = myRecord?.type === 'like';
    profileObj.liked_by_them = theirRecord?.type === 'like';
    profileObj.is_mutual_match = profileObj.liked_by_me && profileObj.liked_by_them;
    profileObj.blocked_by_me = myRecord?.type === 'block';
    profileObj.blocked_by_them = theirRecord?.type === 'block';

    // Log profile view activity if viewing someone else
    if (currentUser.id !== userId) {
      await View.updateOne(
        { viewer_id: currentUser.id, viewed_id: userId },
        { $set: { timestamp: new Date().toISOString() } },
        { upsert: true }
      );
    }

    // Shield email/phone for non-premium viewers
    if (!currentUser.is_premium && currentUser.id !== userId) {
      profileObj.email = null;
      profileObj.phone = null;
    }

    return res.status(200).json(profileObj);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ detail: "Internal server error" });
  }
}

/**
 * List viewers who viewed current user's profile.
 */
async function getProfileViews(req, res) {
  try {
    const user = req.user;

    if (!user.is_premium) {
      return res.status(403).json({ detail: "Upgrade to Premium to see who viewed your profile" });
    }

    const viewsList = await View.find({ viewed_id: user.id })
      .sort({ timestamp: -1 })
      .limit(100);

    const viewers = [];
    for (const v of viewsList) {
      const viewer = await User.findOne(
        { id: v.viewer_id },
        { id: 1, name: 1, profile_photo: 1, city: 1, state: 1, occupation: 1, date_of_birth: 1, _id: 0 }
      );
      if (viewer) {
        const viewerObj = viewer.toObject();
        viewerObj.viewed_at = v.timestamp;
        const isPremium = viewerObj.is_premium && viewerObj.premium_until && new Date(viewerObj.premium_until) > new Date();
        viewerObj.is_premium = isPremium;
        viewerObj.premium_plan = isPremium ? viewerObj.premium_plan : null;
        viewerObj.premium_name = isPremium ? viewerObj.premium_name : null;
        viewers.push(viewerObj);
      }
    }

    return res.status(200).json(viewers);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ detail: "Internal server error" });
  }
}

/**
 * Deletes the authenticated user's profile, cleaning up views, messages, and auth cookies.
 */
async function deleteProfile(req, res) {
  try {
    const userId = req.user.id;

    // Delete profile photo from S3 if it exists
    const userToDelete = await User.findOne({ id: userId });
    if (userToDelete && userToDelete.profile_photo) {
      const oldKey = getS3KeyFromUrl(userToDelete.profile_photo);
      if (oldKey) {
        deleteFromS3(oldKey);
      }
    }

    // Delete user from db
    const deleteResult = await User.deleteOne({ id: userId });
    if (deleteResult.deletedCount === 0) {
      return res.status(404).json({ detail: "User profile not found" });
    }

    // Clean up Views where user was viewer or viewed
    await View.deleteMany({
      $or: [{ viewer_id: userId }, { viewed_id: userId }]
    });

    // Clean up Messages where user was sender or receiver
    await Message.deleteMany({
      $or: [{ sender_id: userId }, { receiver_id: userId }]
    });

    // Clean up Matches where user was user_id or target_id
    await Match.deleteMany({
      $or: [{ user_id: userId }, { target_id: userId }]
    });

    // Clear auth cookies on client
    authService.clearAuthCookies(res);

    return res.status(200).json({ message: "Profile deleted successfully" });
  } catch (err) {
    console.error('Delete profile error:', err);
    return res.status(500).json({ detail: "Internal server error" });
  }
}

module.exports = {
  updateProfile,
  uploadPhoto,
  getFile,
  getProfiles,
  advancedSearch,
  getProfileById,
  getProfileViews,
  deleteProfile
};
