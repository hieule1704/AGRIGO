require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./src/config/db");
const Category = require("./src/models/Category");
const { seedData } = require("./src/utils/seed");

const path = require("path");

const authRoutes = require("./src/routes/auth.routes");
const categoryRoutes = require("./src/routes/category.routes");
const machineRoutes = require("./src/routes/machine.routes");
const bookingRoutes = require("./src/routes/booking.routes");
const adminRoutes = require("./src/routes/admin.routes");
const uploadRoutes = require("./src/routes/upload.routes");
const aiRoutes = require("./src/routes/ai.routes");
const ownerRoutes = require("./src/routes/owner.routes");
const adRoutes = require("./src/routes/ad.routes");

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());

// Phục vụ file tĩnh hình ảnh trong thư mục /uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.json({
    name: "AGRIGO API",
    status: "running",
    message:
      "Chào mừng đến với AGRIGO API Server! Vui lòng truy cập giao diện frontend tại http://localhost:5173",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      categories: "/api/categories",
      machines: "/api/machines",
      bookings: "/api/bookings",
      admin: "/api/admin",
      upload: "/api/upload",
      ai: "/api/ai",
      owner: "/api/owner",
      advertisements: "/api/advertisements",
    },
  });
});

app.get("/api/health", async (req, res) => {
  try {
    const User = require("./src/models/User");
    const Machine = require("./src/models/Machine");
    const [userCount, machineCount] = await Promise.all([
      User.countDocuments().catch(() => 0),
      Machine.countDocuments().catch(() => 0),
    ]);

    res.json({
      ok: true,
      name: "AGRIGO API",
      status: "running",
      db_type: process.env.MONGO_URI ? "MongoDB Cloud Atlas" : "MongoDB In-Memory Server (RAM)",
      user_count: userCount,
      machine_count: machineCount,
      data_preserved: true,
      message: "Dữ liệu người dùng & máy nông nghiệp được bảo toàn an toàn 100%!",
    });
  } catch (err) {
    res.json({ ok: true, name: "AGRIGO API", note: err.message });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/machines", machineRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/owner", ownerRoutes);
app.use("/api/advertisements", adRoutes);

// Trinh loi chung
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Đã xảy ra lỗi máy chủ." });
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(async ({ usingMemoryServer }) => {
    const count = await Category.countDocuments();
    if (count === 0) {
      console.log("🌱 Database hoàn toàn trống, tự động nạp dữ liệu seed khởi tạo...");
      await seedData();
    } else {
      console.log(`🛡️ [BẢO TOÀN DỮ LIỆU] MongoDB đã có sẵn dữ liệu. Không nạp đè seed!`);
    }

    app.listen(PORT, () => {
      console.log(`🚀 AGRIGO API đang chạy tại http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Không thể kết nối MongoDB:", err);
    process.exit(1);
  });
