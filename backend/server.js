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
    },
  });
});

app.get("/api/health", (req, res) =>
  res.json({ ok: true, name: "AGRIGO API" }),
);

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/machines", machineRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/ai", aiRoutes);

// Trinh loi chung
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Đã xảy ra lỗi máy chủ." });
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(async ({ usingMemoryServer }) => {
    const count = await Category.countDocuments();
    if (usingMemoryServer || count === 0) {
      console.log(
        "🌱 Database đang trống hoặc dùng In-Memory DB, tự động nạp dữ liệu seed...",
      );
      await seedData();
    }

    app.listen(PORT, () => {
      console.log(`🚀 AGRIGO API đang chạy tại http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Không thể kết nối MongoDB:", err);
    process.exit(1);
  });
