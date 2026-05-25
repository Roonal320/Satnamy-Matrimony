const User = require('../models/User');
const View = require('../models/View');
const profileService = require('../services/profile.service');
const authService = require('../services/auth.service');
const path = require('path');
const fs = require('fs');

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
    return res.status(200).json(userObj);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ detail: "Internal server error" });
  }
}

/**
 * Handle user profile image uploads.
 */
async function uploadPhoto(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ detail: "No file uploaded" });
    }

    const relativePath = `satnami-matrimony/profiles/${req.user.id}/${req.file.filename}`;
    await User.updateOne({ id: req.user.id }, { $set: { profile_photo: relativePath } });

    return res.status(200).json({
      path: relativePath,
      message: "Photo uploaded successfully"
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ detail: "Internal server error" });
  }
}

/**
 * Securely serve uploaded files.
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
            query.id = { $ne: userObj.id };
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
    const profilesList = profiles.map(p => p.toObject());

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
          query.id = { $ne: decoded.sub };
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

    const profilesList = profiles.map(p => p.toObject());

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

    const profile = await User.findOne({ id: userId });
    if (!profile) {
      return res.status(404).json({ detail: "Profile not found" });
    }

    const profileObj = profile.toObject();
    delete profileObj.password_hash;
    delete profileObj._id;

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
        viewers.push(viewerObj);
      }
    }

    return res.status(200).json(viewers);
  } catch (err) {
    console.error(err);
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
  getProfileViews
};
