// src/config/db.js
const mongoose = require("mongoose");

let memoryServer = null;

async function connectDB() {
  const uri = process.env.MONGO_URI;

  try {
    if (!uri) throw new Error("Chưa cấu hình biến môi trường MONGO_URI");
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log("✅ [MONGODB CLOUD] Đã kết nối thành công tới MongoDB Atlas!");
    return { usingMemoryServer: false };
  } catch (err) {
    console.warn(`⚠️ Lỗi kết nối MongoDB Cloud Atlas (${err.message}). Chuyển sang MongoDB In-Memory cho chế độ Offline Demo...`);
    const { MongoMemoryServer } = require("mongodb-memory-server");
    memoryServer = await MongoMemoryServer.create();
    const memUri = memoryServer.getUri();
    await mongoose.connect(memUri);
    console.log("⚡ Đã kích hoạt MongoDB In-Memory Server!");
    return { usingMemoryServer: true };
  }
}

module.exports = { connectDB };
