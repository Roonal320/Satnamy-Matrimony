const mongoose = require('mongoose');
const uuid = require('uuid');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function connectDb() {
  const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017';
  const dbName = process.env.DB_NAME || 'satnami_db';

  const options = {
    dbName: dbName,
  };

  if (mongoUrl.includes('mongodb+srv')) {
    options.serverSelectionTimeoutMS = 5000;
  }

  try {
    await mongoose.connect(mongoUrl, options);
    console.log("Connected to MongoDB configured instance via Mongoose");
  } catch (err) {
    console.warn(`Mongoose connection to configured URL failed: ${err.message}. Falling back to local MongoDB.`);
    try {
      await mongoose.connect('mongodb://localhost:27017', {
        dbName: dbName
      });
      console.log("Connected to local fallback MongoDB via Mongoose");
    } catch (localErr) {
      console.error("Local MongoDB fallback connection failed:", localErr.message);
      process.exit(1);
    }
  }

  // Seed Admin Account
  try {
    const User = require('../models/User');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@satnamimatrimony.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

    const existing = await User.findOne({ email: adminEmail.toLowerCase() });
    if (!existing) {
      const adminId = uuid.v4();
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      await User.create({
        id: adminId,
        email: adminEmail.toLowerCase(),
        password_hash: passwordHash,
        name: "Admin",
        phone: "9999999999",
        gender: "Male",
        date_of_birth: "1990-01-01",
        role: "admin",
        profile_completed: true,
        is_premium: true,
        created_at: new Date().toISOString()
      });
      console.log(`Admin seeded: ${adminEmail}`);
    }

    // Write test credentials to memory
    const memoryDir = path.join(__dirname, '..', 'memory');
    if (!fs.existsSync(memoryDir)) {
      fs.mkdirSync(memoryDir, { recursive: true });
    }
    const testCredentialsContent = `# Test Credentials\n\n## Admin Account\n- Email: ${adminEmail}\n- Password: ${adminPassword}\n- Role: admin\n\n## Auth Endpoints\n- POST /api/auth/register\n- POST /api/auth/login\n- GET /api/auth/me\n- POST /api/auth/logout\n`;
    fs.writeFileSync(path.join(memoryDir, 'test_credentials.md'), testCredentialsContent);
  } catch (seedErr) {
    console.error("Error seeding admin during database init:", seedErr.message);
  }
}

module.exports = { connectDb };
