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
  "Long Xuyên", "Châu Đốc", "Châu Phú", "Chợ Mới",
  "Thoại Sơn", "Tri Tôn", "Phú Tân", "Tân Châu",
  "Tịnh Biên", "Châu Thành", "An Phú"
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
  "An Phú": { lat: 10.8833, lng: 105.0833 },
};

const CATEGORY_PLACEHOLDERS = {
  'may-cay': 'https://img.websosanh.vn/v10/users/keydes/images/hhctben04tx32/may-cay-trung-quoc.jpg?w=800&auto=format&fit=crop&q=80',
  'may-gat': 'https://www.kubota.com/innovation/evolution/agriculture/detail/img/img_2010_main.jpg?w=800&auto=format&fit=crop&q=80',
  'may-cay-lua': 'https://down-vn.img.susercontent.com/file/vn-11134207-7qukw-lff8yrb3qiroc8?w=800&auto=format&fit=crop&q=80',
  'drone-phun-thuoc': 'https://thapxanh.com/images/thumbs/0038133_drone-phun-thuoc-sau-xlp450-may-bay-phun-thuoc-sau-dieu-khien-tu-xa_510.jpeg?w=800&auto=format&fit=crop&q=80',
  'may-say': 'https://i.ytimg.com/vi/4vP1ykKNG60/maxresdefault.jpg?w=800&auto=format&fit=crop&q=80',
  'may-xoi-dat': 'https://www.thietbim5s.vn/upload/images/may-xoi-dat-mini.jpg?w=800&auto=format&fit=crop&q=80',
};

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
  const catMap = Object.fromEntries(categories.map((c) => [c.slug, c._id]));

  console.log("🌱 Tạo tài khoản mẫu...");
  const pass = await bcrypt.hash("123456", 10);
  const admin = await User.create({
    full_name: "Quản trị viên AGRIGO",
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
    phone: "0909123456",
    district: "Thoại Sơn",
  });

  const owner1 = await User.create({
    full_name: "Trần Văn Máy (Nông Cơ Châu Phú)",
    email: "owner@agrigo.vn",
    password_hash: pass,
    role: "owner",
    phone: "0908888111",
    district: "Châu Phú",
  });

  const owner2 = await User.create({
    full_name: "Lê Thị Cơ Giới (Nông Nghiệp Tri Tôn)",
    email: "owner2@agrigo.vn",
    password_hash: pass,
    role: "owner",
    phone: "0908888222",
    district: "Tri Tôn",
  });

  const owner3 = await User.create({
    full_name: "Nguyễn Hoàng Nông Cụ",
    email: "owner3@agrigo.vn",
    password_hash: pass,
    role: "owner",
    phone: "0908888333",
    district: "Thoại Sơn",
  });

  const owner4 = await User.create({
    full_name: "Phạm Văn Nông Cơ",
    email: "owner4@agrigo.vn",
    password_hash: pass,
    role: "owner",
    phone: "0908888444",
    district: "Long Xuyên",
  });

  const owner5 = await User.create({
    full_name: "Đặng Hữu Cơ Giới",
    email: "owner5@agrigo.vn",
    password_hash: pass,
    role: "owner",
    phone: "0908888555",
    district: "Châu Đốc",
  });

  const owners = [owner1, owner2, owner3, owner4, owner5];

  console.log("🌱 Tạo danh sách 35+ máy nông nghiệp bao phủ 11 huyện An Giang...");

  const baseMachinesData = [
    // Long Xuyên
    { name: "Máy cày Kubota L4508 45HP", cat: "may-cay", price: 1200000, brand: "Kubota", year: 2021, district: "Long Xuyên" },
    { name: "Máy gặt đập liên hợp Yanmar AW82V", cat: "may-gat", price: 2600000, brand: "Yanmar", year: 2022, district: "Long Xuyên" },
    { name: "Drone phun thuốc DJI Agras T40", cat: "drone-phun-thuoc", price: 850000, brand: "DJI", year: 2023, district: "Long Xuyên" },

    // Châu Đốc
    { name: "Máy cày John Deere 5045D", cat: "may-cay", price: 1350000, brand: "John Deere", year: 2020, district: "Châu Đốc" },
    { name: "Máy gặt đập Kubota DC70G", cat: "may-gat", price: 2400000, brand: "Kubota", year: 2021, district: "Châu Đốc" },
    { name: "Máy cấy lúa Kubota SPW-48C 4 hàng", cat: "may-cay-lua", price: 950000, brand: "Kubota", year: 2022, district: "Châu Đốc" },

    // Châu Phú
    { name: "Máy gặt đập liên hợp Yanmar AG1100", cat: "may-gat", price: 2500000, brand: "Yanmar", year: 2020, district: "Châu Phú" },
    { name: "Máy cày Shibaura ST330", cat: "may-cay", price: 1100000, brand: "Shibaura", year: 2019, district: "Châu Phú" },
    { name: "Máy sấy lúa vỉ ngang 10 tấn", cat: "may-say", price: 1800000, brand: "Việt Nam", year: 2021, district: "Châu Phú" },
    { name: "Máy xới đất Kubota RX220", cat: "may-xoi-dat", price: 650000, brand: "Kubota", year: 2022, district: "Châu Phú" },

    // Chợ Mới
    { name: "Máy cày Iseki NT540 40HP", cat: "may-cay", price: 1150000, brand: "Iseki", year: 2021, district: "Chợ Mới" },
    { name: "Máy gặt đập Kubota DC105X", cat: "may-gat", price: 2800000, brand: "Kubota", year: 2023, district: "Chợ Mới" },
    { name: "Drone phun thuốc DJI Agras T30", cat: "drone-phun-thuoc", price: 750000, brand: "DJI", year: 2022, district: "Chợ Mới" },
    { name: "Máy cấy lúa Hamader 6 hàng", cat: "may-cay-lua", price: 1000000, brand: "Hamader", year: 2021, district: "Chợ Mới" },

    // Thoại Sơn
    { name: "Máy gặt Kubota DC70 Plus", cat: "may-gat", price: 2450000, brand: "Kubota", year: 2022, district: "Thoại Sơn" },
    { name: "Máy cày Kubota M6040 60HP", cat: "may-cay", price: 1400000, brand: "Kubota", year: 2021, district: "Thoại Sơn" },
    { name: "Máy xới đất Honda F501", cat: "may-xoi-dat", price: 550000, brand: "Honda", year: 2020, district: "Thoại Sơn" },
    { name: "Drone phun thuốc XAG P40", cat: "drone-phun-thuoc", price: 700000, brand: "XAG", year: 2022, district: "Thoại Sơn" },

    // Tri Tôn
    { name: "Máy cày Mahindra 575 DI 50HP", cat: "may-cay", price: 1250000, brand: "Mahindra", year: 2022, district: "Tri Tôn" },
    { name: "Máy gặt đập Yanmar YH850", cat: "may-gat", price: 2700000, brand: "Yanmar", year: 2023, district: "Tri Tôn" },
    { name: "Máy sấy lúa tháp đứng 15 tấn", cat: "may-say", price: 2200000, brand: "Bùi Văn Ngọ", year: 2021, district: "Tri Tôn" },
    { name: "Máy cấy lúa Yanmar VP6", cat: "may-cay-lua", price: 1100000, brand: "Yanmar", year: 2022, district: "Tri Tôn" },

    // Phú Tân
    { name: "Máy cày Yanmar EF393T", cat: "may-cay", price: 1200000, brand: "Yanmar", year: 2020, district: "Phú Tân" },
    { name: "Máy gặt lúa Kubota DC70", cat: "may-gat", price: 2350000, brand: "Kubota", year: 2021, district: "Phú Tân" },
    { name: "Drone rải phân & phun thuốc T30", cat: "drone-phun-thuoc", price: 800000, brand: "DJI", year: 2023, district: "Phú Tân" },

    // Tân Châu
    { name: "Máy cày John Deere 5310", cat: "may-cay", price: 1450000, brand: "John Deere", year: 2021, district: "Tân Châu" },
    { name: "Máy gặt đập Yanmar AW70V", cat: "may-gat", price: 2300000, brand: "Yanmar", year: 2020, district: "Tân Châu" },
    { name: "Máy xới đất Trùn Quế RX180", cat: "may-xoi-dat", price: 600000, brand: "Trùn Quế", year: 2021, district: "Tân Châu" },

    // Tịnh Biên
    { name: "Máy cày Kubota L5018 50HP", cat: "may-cay", price: 1300000, brand: "Kubota", year: 2022, district: "Tịnh Biên" },
    { name: "Máy gặt liên hợp Kubota DC70G PRO", cat: "may-gat", price: 2550000, brand: "Kubota", year: 2023, district: "Tịnh Biên" },
    { name: "Máy cấy lúa ngồi lái Kubota SPW-68", cat: "may-cay-lua", price: 1200000, brand: "Kubota", year: 2021, district: "Tịnh Biên" },

    // Châu Thành
    { name: "Máy cày Shibaura D23F", cat: "may-cay", price: 1050000, brand: "Shibaura", year: 2019, district: "Châu Thành" },
    { name: "Máy gặt đập Yanmar AG1100 Turbo", cat: "may-gat", price: 2650000, brand: "Yanmar", year: 2022, district: "Châu Thành" },
    { name: "Drone rải giống & phun thuốc DJI T20P", cat: "drone-phun-thuoc", price: 780000, brand: "DJI", year: 2023, district: "Châu Thành" },

    // An Phú
    { name: "Máy cày Kubota L3408 34HP", cat: "may-cay", price: 1000000, brand: "Kubota", year: 2020, district: "An Phú" },
    { name: "Máy gặt liên hợp Kubota DC70", cat: "may-gat", price: 2300000, brand: "Kubota", year: 2021, district: "An Phú" },
    { name: "Máy sấy lúa công nghiệp 12 tấn", cat: "may-say", price: 1950000, brand: "Bùi Văn Ngọ", year: 2022, district: "An Phú" },
  ];

  const createdMachines = [];

  for (let i = 0; i < baseMachinesData.length; i++) {
    const item = baseMachinesData[i];
    const owner = owners[i % owners.length];
    const coords = DISTRICT_COORDS[item.district] || { lat: 10.3833, lng: 105.4167 };
    
    // Tạo khoảng offset ngẫu nhiên nhẹ để ghim marker không đè lên nhau
    const lat = Number((coords.lat + (Math.random() * 0.036 - 0.018)).toFixed(6));
    const lng = Number((coords.lng + (Math.random() * 0.036 - 0.018)).toFixed(6));
    const ratingAvg = Number((3.8 + Math.random() * 1.2).toFixed(1));
    const ratingCount = Math.floor(Math.random() * 18) + 2;

    const doc = await Machine.create({
      owner_id: owner._id,
      category_id: catMap[item.cat],
      name: item.name,
      description: `${item.name} sản xuất năm ${item.year}, thuộc sở hữu của ${owner.full_name}. Máy hoạt động cực tốt, bảo dưỡng định kỳ, phục vụ tận tình cho bà con khu vực ${item.district} và vùng lân cận.`,
      brand: item.brand,
      year_made: item.year,
      price_per_day: item.price,
      price_unit: "ngày",
      district: item.district,
      address_detail: `Ấp Vĩnh Hòa, Xã Tân Lập, ${item.district}`,
      lat,
      lng,
      image_url: CATEGORY_PLACEHOLDERS[item.cat],
      status: "approved",
      rating_avg: ratingAvg,
      rating_count: ratingCount,
    });

    createdMachines.push(doc);
  }

  // Tạo thêm 2 máy chờ duyệt để demo trang Admin Duyệt bài
  await Machine.create({
    owner_id: owner1._id,
    category_id: catMap["may-cay"],
    name: "Máy cày Mahindra 575 DI (Mới đăng - Chờ duyệt)",
    brand: "Mahindra",
    year_made: 2023,
    price_per_day: 1150000,
    price_unit: "ngày",
    district: "Long Xuyên",
    lat: 10.3860,
    lng: 105.4190,
    status: "pending",
    description: "Máy cày Mahindra mới mua đầu mùa vụ 2023, hoạt động bền bỉ, cần admin duyệt để nhận đơn làm lúa.",
  });

  await Machine.create({
    owner_id: owner3._id,
    category_id: catMap["drone-phun-thuoc"],
    name: "Drone DJI T40 Công suất cao (Chờ duyệt)",
    brand: "DJI",
    year_made: 2024,
    price_per_day: 900000,
    price_unit: "ngày",
    district: "Thoại Sơn",
    lat: 10.2850,
    lng: 105.2350,
    status: "pending",
    description: "Drone rải hạt và phun thuốc BVTV cực nhanh, 100 công ruộng/ngày.",
  });

  console.log("🌱 Tạo lịch đặt mẫu và đánh giá từ nông dân...");
  
  // Đơn 1: Đang chờ chủ máy duyệt
  await Booking.create({
    machine_id: createdMachines[0]._id,
    farmer_id: farmer._id,
    owner_id: createdMachines[0].owner_id,
    start_date: "2026-08-10",
    end_date: "2026-08-12",
    days: 3,
    price_per_day: createdMachines[0].price_per_day,
    total_price: createdMachines[0].price_per_day * 3,
    commission_rate: 0.05,
    commission_amount: Math.round(createdMachines[0].price_per_day * 3 * 0.05),
    status: "pending",
    note: "Thuê cày 5 công ruộng ở Thoại Sơn, làm buổi sáng.",
  });

  // Đơn 2: Đã hoàn tất và có Đánh giá
  const completedBooking = await Booking.create({
    machine_id: createdMachines[1]._id,
    farmer_id: farmer._id,
    owner_id: createdMachines[1].owner_id,
    start_date: "2026-07-20",
    end_date: "2026-07-22",
    days: 3,
    price_per_day: createdMachines[1].price_per_day,
    total_price: createdMachines[1].price_per_day * 3,
    commission_rate: 0.05,
    commission_amount: Math.round(createdMachines[1].price_per_day * 3 * 0.05),
    status: "completed",
    note: "Gặt lúa vụ Hè Thu đúng tiến độ.",
  });

  await Review.create({
    booking_id: completedBooking._id,
    machine_id: createdMachines[1]._id,
    farmer_id: farmer._id,
    rating: 5,
    comment: "Máy gặt làm rất sạch lúa, không bị thất thoát hạt. Chủ máy nhiệt tình, đến đúng 6h sáng!",
  });

  console.log("✅ Seed dữ liệu thành công với 35+ máy nông nghiệp khắp 11 huyện An Giang!");
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
