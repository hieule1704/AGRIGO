// src/config/db.js
const mongoose = require("mongoose");

let memoryServer = null;

async function connectDB() {
  const uri = process.env.MONGO_URI;

  try {
    if (!uri) throw new Error("Chưa cấu hình MONGO_URI");
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    console.log("✅ Đã kết nối MongoDB thành công!");
    return { usingMemoryServer: false };
  } catch (err) {
    console.warn("⚠️ Không thể kết nối MongoDB URI đã cấu hình, chuyển sang MongoDB In-Memory (offline demo)...");
    const { MongoMemoryServer } = require("mongodb-memory-server");
    memoryServer = await MongoMemoryServer.create();
    const memUri = memoryServer.getUri();
    await mongoose.connect(memUri);
    console.log("⚡ Đã kích hoạt MongoDB In-Memory Server!");
    return { usingMemoryServer: true };
  }
}

module.exports = { connectDB };
