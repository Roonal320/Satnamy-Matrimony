const Report = require('../models/Report');
const User = require('../models/User');
const uuid = require('uuid');

async function createReport(req, res) {
  try {
    const reporterId = req.user.id;
    const { reported_user_id, reason, details } = req.body;

    if (!reported_user_id || !reason) {
      return res.status(422).json({ detail: "Missing reported_user_id or reason" });
    }

    if (reporterId === reported_user_id) {
      return res.status(400).json({ detail: "You cannot report yourself" });
    }

    // Verify reported user exists
    const reportedUser = await User.findOne({ id: reported_user_id });
    if (!reportedUser) {
      return res.status(404).json({ detail: "User not found" });
    }

    const report = await Report.create({
      id: uuid.v4(),
      reporter_id: reporterId,
      reported_user_id: reported_user_id,
      reason: reason,
      details: details || "",
      created_at: new Date().toISOString()
    });

    console.log(`[User Report Filed] Report ID: ${report.id} | Reporter: ${reporterId} | Subject: ${reported_user_id} | Reason: ${reason}`);

    return res.status(200).json({ 
      success: true, 
      message: "User reported successfully", 
      report_id: report.id 
    });
  } catch (err) {
    console.error('[Report Controller Error]', err);
    return res.status(500).json({ detail: "Internal server error" });
  }
}

module.exports = {
  createReport
};
