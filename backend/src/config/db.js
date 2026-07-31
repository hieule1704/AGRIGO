// src/config/db.js
const mongoose = require("mongoose");

let memoryServer = null;

async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("Chưa cấu hình MONGO_URI trong file .env");
  }

  await mongoose.connect(uri);
  console.log("✅ Đã kết nối MongoDB Atlas thành công!");
  return { usingMemoryServer: false };
}

module.exports = { connectDB };
