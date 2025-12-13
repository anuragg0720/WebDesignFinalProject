// scripts/seedUsers.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: 'husky_ai',
    });
    console.log('✅ Connected to MongoDB');

    // WARNING: This wipes the users collection for a clean seed
    await User.deleteMany({});
    console.log('🧹 Cleared existing users');

    const password = 'Test1234';
    const hash = await bcrypt.hash(password, 10);

    const users = [
      {
        email: 'student@northeastern.edu',
        passwordHash: hash,
        role: 'student',
        displayName: 'Student User',
      },
      {
        email: 'faculty@northeastern.edu',
        passwordHash: hash,
        role: 'faculty',
        displayName: 'Faculty User',
      },
      {
        email: 'superadmin@northeastern.edu',
        passwordHash: hash,
        role: 'super-admin',
        displayName: 'Super Admin',
      },
      {
        email: 'huskyadmin@northeastern.edu',
        passwordHash: hash,
        role: 'husky-admin',
        displayName: 'Husky Admin',
      },
      {
        email: 'support@northeastern.edu',
        passwordHash: hash,
        role: 'support',
        displayName: 'Support Staff',
      },
    ];

    await User.insertMany(users);
    console.log('✅ Seeded users:');
    users.forEach((u) => console.log(`  - ${u.email} (${u.role})`));

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

main();
