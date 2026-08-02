require('dotenv').config();
const mongoose = require('mongoose');
const { runSmartSeed } = require('./smartSeed');

async function seed() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/agrigo';
    await mongoose.connect(mongoUri);
    console.log('🔌 Đã kết nối cơ sở dữ liệu MongoDB Atlas...');

    await runSmartSeed();

    console.log('🎉 Hoàn tất nạp dữ liệu Smart Seed!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi khi chạy Smart Seed:', err);
    process.exit(1);
  }
}

seed();
