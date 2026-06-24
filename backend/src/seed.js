const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('./models/User');

async function seed() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri || uri.includes('<username>')) {
      console.error('❌ MONGODB_URI is not set properly in backend/.env');
      console.error('   Open backend/.env and replace the placeholder with your real Atlas URI.');
      process.exit(1);
    }
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB Atlas');

    const adminExists = await User.findOne({ email: 'admin@medishare.com' });
    if (!adminExists) {
      await User.create({
        name: 'MediShare Admin',
        email: 'admin@medishare.com',
        password: 'owner@123',
        role: 'admin',
      });
      console.log('✅ Admin created: admin@medishare.com / admin123');
    } else {
      console.log('ℹ️  Admin already exists, skipping.');
    }

    await mongoose.disconnect();
    console.log('✅ Done! Now run: npm start');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

seed();