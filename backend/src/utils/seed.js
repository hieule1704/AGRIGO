require("dotenv").config();
const bcrypt = require("bcryptjs");
const { connectDB } = require("../config/db");
const User = require("../models/User");
const Category = require("../models/Category");
const Machine = require("../models/Machine");
const Booking = require("../models/Booking");
const Review = require("../models/Review");

const CATEGORIES = [
  { name: "Máy cày", slug: "may-cay", icon: "🚜" },
  { name: "Máy gặt đập liên hợp", slug: "may-gat", icon: "🌾" },
  { name: "Máy cấy lúa", slug: "may-cay-lua", icon: "🌱" },
  { name: "Drone phun thuốc", slug: "drone-phun-thuoc", icon: "🚁" },
  { name: "Máy sấy lúa", slug: "may-say", icon: "🔥" },
  { name: "Máy xới đất", slug: "may-xoi-dat", icon: "⚙️" },
];

const DISTRICTS = [
  "Long Xuyên",
  "Châu Đốc",
  "Châu Phú",
  "Chợ Mới",
  "Thoại Sơn",
  "Tri Tôn",
];

async function seedData() {
  console.log("🌱 Đang xoá dữ liệu cũ...");
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Machine.deleteMany({}),
    Booking.deleteMany({}),
    Review.deleteMany({}),
  ]);

  console.log("🌱 Tạo danh mục...");
  const categories = await Category.insertMany(CATEGORIES);

  console.log("🌱 Tạo tài khoản mẫu...");
  const pass = await bcrypt.hash("123456", 10);
  const admin = await User.create({
    full_name: "Quản trị viên",
    email: "admin@agrigo.vn",
    password_hash: pass,
    role: "admin",
    district: "Long Xuyên",
  });
  const farmer = await User.create({
    full_name: "Nguyễn Văn Nông",
    email: "farmer@agrigo.vn",
    password_hash: pass,
    role: "farmer",
    phone: "0900000001",
    district: "Thoại Sơn",
  });
  const owner1 = await User.create({
    full_name: "Trần Văn Máy",
    email: "owner@agrigo.vn",
    password_hash: pass,
    role: "owner",
    phone: "0900000002",
    district: "Châu Phú",
  });
  const owner2 = await User.create({
    full_name: "Lê Thị Cơ Giới",
    email: "owner2@agrigo.vn",
    password_hash: pass,
    role: "owner",
    phone: "0900000003",
    district: "Tri Tôn",
  });

  console.log("🌱 Tạo máy nông nghiệp mẫu...");
  const sampleMachines = [
    {
      name: "Máy cày Kubota L4508",
      cat: "may-cay",
      owner: owner1,
      price: 1200000,
      brand: "Kubota",
      year: 2021,
      image_url: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&auto=format&fit=crop&q=80",
    },
    {
      name: "Máy gặt đập liên hợp Yanmar AG1100",
      cat: "may-gat",
      owner: owner1,
      price: 2500000,
      brand: "Yanmar",
      year: 2020,
      image_url: "https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&auto=format&fit=crop&q=80",
    },
    {
      name: "Máy cấy lúa Kubota SPW-48C",
      cat: "may-cay-lua",
      owner: owner2,
      price: 900000,
      brand: "Kubota",
      year: 2022,
      image_url: "https://images.unsplash.com/photo-1530507629858-e4977d30e9e0?w=800&auto=format&fit=crop&q=80",
    },
    {
      name: "Drone phun thuốc DJI Agras T30",
      cat: "drone-phun-thuoc",
      owner: owner2,
      price: 700000,
      brand: "DJI",
      year: 2023,
      image_url: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80",
    },
    {
      name: "Máy sấy lúa tĩnh vỉ ngang 8 tấn",
      cat: "may-say",
      owner: owner1,
      price: 1800000,
      brand: "Việt Nam",
      year: 2019,
      image_url: "https://images.unsplash.com/photo-1595246140625-573b715d11dc?w=800&auto=format&fit=crop&q=80",
    },
    {
      name: "Máy xới đất Kubota RX",
      cat: "may-xoi-dat",
      owner: owner2,
      price: 600000,
      brand: "Kubota",
      year: 2020,
      image_url: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80",
    },
    {
      name: "Máy cày John Deere 5410",
      cat: "may-cay",
      owner: owner2,
      price: 1500000,
      brand: "John Deere",
      year: 2022,
      image_url: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&auto=format&fit=crop&q=80",
    },
    {
      name: "Máy gặt Kubota DC70",
      cat: "may-gat",
      owner: owner1,
      price: 2300000,
      brand: "Kubota",
      year: 2021,
      image_url: "https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&auto=format&fit=crop&q=80",
    },
  ];

const DISTRICT_COORDS = {
  "Long Xuyên": { lat: 10.3833, lng: 105.4167 },
  "Châu Đốc": { lat: 10.7000, lng: 105.1167 },
  "Châu Phú": { lat: 10.5500, lng: 105.1333 },
  "Chợ Mới": { lat: 10.4500, lng: 105.5333 },
  "Thoại Sơn": { lat: 10.2833, lng: 105.2333 },
  "Tri Tôn": { lat: 10.4167, lng: 105.0000 },
  "Phú Tân": { lat: 10.6333, lng: 105.3500 },
  "Tân Châu": { lat: 10.8000, lng: 105.2333 },
  "Tịnh Biên": { lat: 10.6000, lng: 104.9500 },
  "Châu Thành": { lat: 10.4333, lng: 105.3167 },
};

  const catMap = Object.fromEntries(categories.map((c) => [c.slug, c._id]));
  const machines = [];
  for (const m of sampleMachines) {
    const district = DISTRICTS[Math.floor(Math.random() * DISTRICTS.length)];
    const coords = DISTRICT_COORDS[district] || { lat: 10.3833, lng: 105.4167 };
    // Thêm khoảng chênh lệch nhỏ ngẫu nhiên để các máy cùng huyện không đè khít lên nhau trên bản đồ
    const lat = Number((coords.lat + (Math.random() * 0.03 - 0.015)).toFixed(6));
    const lng = Number((coords.lng + (Math.random() * 0.03 - 0.015)).toFixed(6));

    const doc = await Machine.create({
      owner_id: m.owner._id,
      category_id: catMap[m.cat],
      name: m.name,
      description: `${m.name} đời ${m.year}, hoạt động tốt, sẵn sàng phục vụ bà con khu vực ${district} và lân cận.`,
      brand: m.brand,
      year_made: m.year,
      price_per_day: m.price,
      price_unit: "ngày",
      district,
      address_detail: `Ấp 1, xã ${district}`,
      lat,
      lng,
      image_url: m.image_url,
      status: "approved",
      rating_avg: (3.5 + Math.random() * 1.5).toFixed(1),
      rating_count: Math.floor(Math.random() * 20) + 1,
    });
    machines.push(doc);
  }

  // Them 1 may cho pending de demo trang duyet admin
  await Machine.create({
    owner_id: owner1._id,
    category_id: catMap["may-cay"],
    name: "Máy cày Mahindra 575 (chờ duyệt)",
    brand: "Mahindra",
    year_made: 2023,
    price_per_day: 1100000,
    price_unit: "ngày",
    district: "Long Xuyên",
    lat: 10.3850,
    lng: 105.4180,
    status: "pending",
    description: "Máy mới đăng, đang chờ admin duyệt.",
  });

  console.log("🌱 Tạo đơn đặt lịch mẫu...");
  await Booking.create({
    machine_id: machines[0]._id,
    farmer_id: farmer._id,
    owner_id: owner1._id,
    start_date: "2026-08-05",
    end_date: "2026-08-06",
    days: 2,
    price_per_day: machines[0].price_per_day,
    total_price: machines[0].price_per_day * 2,
    commission_amount: Math.round(machines[0].price_per_day * 2 * 0.05),
    status: "pending",
    note: "3 công ruộng, cần cày trước khi sạ.",
  });

  console.log("✅ Seed dữ liệu hoàn tất!");
  console.log("   Tài khoản demo (mật khẩu: 123456):");
  console.log("   - admin@agrigo.vn  (Quản trị viên)");
  console.log("   - farmer@agrigo.vn (Nông dân)");
  console.log("   - owner@agrigo.vn / owner2@agrigo.vn (Chủ máy)");
}

async function run() {
  await connectDB();
  await seedData();
  process.exit(0);
}

if (require.main === module) {
  run().catch((err) => {
    console.error("❌ Lỗi khi seed:", err);
    process.exit(1);
  });
}

module.exports = { seedData };
