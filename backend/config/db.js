const mongoose = require('mongoose');

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
    console.error(`MongoDB connection failed: ${err.message}`);
    process.exit(1);
  }

  // Seed Admin Account
  try {
    const User = require('../models/User');
    const bcrypt = require('bcryptjs');
    const uuid = require('uuid');
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
  } catch (seedErr) {
    console.error("Error seeding admin during database init:", seedErr.message);
  }
}

module.exports = { connectDb };

