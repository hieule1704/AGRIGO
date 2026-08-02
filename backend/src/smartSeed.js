const User = require('./models/User');
const Machine = require('./models/Machine');
const Category = require('./models/Category');
const Booking = require('./models/Booking');
const Review = require('./models/Review');
const Advertisement = require('./models/Advertisement');
const bcrypt = require('bcryptjs');

const DISTRICTS = [
  'Long Xuyên', 'Châu Đốc', 'An Phú', 'Tân Châu', 'Châu Phú',
  'Châu Thành', 'Chợ Mới', 'Phú Tân', 'Thoại Sơn', 'Tịnh Biên', 'Tri Tôn'
];

async function runSmartSeed() {
  console.log('🌱 Bắt đầu tiến trình Smart Seed (Bảo tồn dữ liệu tùy chỉnh của người dùng)...');

  // 1. Lưu giữ các máy và ảnh tùy chỉnh mà người dùng đã đăng (Đặc biệt là tài khoản owner_vip & lehieu17042004)
  const customUsers = await User.find({
    email: { $in: ['owner_vip@agrigo.vn', 'lehieu17042004@gmail.com', 'admin@agrigo.vn', 'farmer_demo@agrigo.vn', 'owner_demo@agrigo.vn'] }
  });

  const customUserMap = {};
  customUsers.forEach(u => { customUserMap[u.email] = u; });

  // Đảm bảo các tài khoản cốt lõi luôn tồn tại
  const defaultPasswordHash = await bcrypt.hash('123456', 10);

  if (!customUserMap['admin@agrigo.vn']) {
    const admin = await User.create({
      full_name: 'Quản Trị Viên AGRIGO',
      email: 'admin@agrigo.vn',
      phone: '0901234567',
      password_hash: defaultPasswordHash,
      role: 'admin',
      district: 'Long Xuyên',
      address: 'Số 1 Trần Hưng Đạo, TP. Long Xuyên',
      status: 'active',
    });
    customUserMap['admin@agrigo.vn'] = admin;
  }

  if (!customUserMap['owner_vip@agrigo.vn']) {
    const ownerVip = await User.create({
      full_name: 'Tập Đoàn Cơ Giới VIP An Giang',
      email: 'owner_vip@agrigo.vn',
      phone: '0988776655',
      password_hash: defaultPasswordHash,
      role: 'owner',
      district: 'Thoại Sơn',
      address: 'Ấp Phước Thạnh, Xã Mỹ Phú Đông, Huyện Thoại Sơn',
      is_premium: true,
      premium_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      avatar_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400',
      status: 'active',
    });
    customUserMap['owner_vip@agrigo.vn'] = ownerVip;
  }

  if (!customUserMap['lehieu17042004@gmail.com']) {
    const userHieu = await User.create({
      full_name: 'Lê Hiếu (Chủ Máy Hậu Giang & An Giang)',
      email: 'lehieu17042004@gmail.com',
      phone: '0912345678',
      password_hash: defaultPasswordHash,
      role: 'owner',
      district: 'Châu Phú',
      address: 'Xã Vĩnh Thạnh Trung, Huyện Châu Phú',
      is_premium: true,
      premium_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      status: 'active',
    });
    customUserMap['lehieu17042004@gmail.com'] = userHieu;
  }

  if (!customUserMap['farmer_demo@agrigo.vn']) {
    const farmer = await User.create({
      full_name: 'Chú Ba Nông Dân (Thoại Sơn)',
      email: 'farmer_demo@agrigo.vn',
      phone: '0939112233',
      password_hash: defaultPasswordHash,
      role: 'farmer',
      district: 'Thoại Sơn',
      address: 'Ấp Hòa Thạnh, Xã Định Thành, Huyện Thoại Sơn',
      status: 'active',
    });
    customUserMap['farmer_demo@agrigo.vn'] = farmer;
  }

  // 2. Bảo tồn các máy tùy chỉnh mà người dùng đã tải ảnh hoặc chỉnh sửa
  const existingCustomMachines = await Machine.find({
    owner_id: { $in: Object.values(customUserMap).map(u => u._id) }
  });

  console.log(`📸 Tìm thấy ${existingCustomMachines.length} máy tùy chỉnh đã có ảnh bảo tồn.`);

  // 3. Khởi tạo danh mục máy chuẩn
  const categoryDefs = [
    { name: 'Máy gặt đập liên hợp', slug: 'may-gat-dap', description: 'Gặt đập liên hợp lúa Kubota, Yanmar công suất lớn' },
    { name: 'Máy cày & Xới đất', slug: 'may-cay', description: 'Máy cày 4 bánh xới đất, phay đất, chuẩn bị công ruộng' },
    { name: 'Drone phun thuốc & Sạ lúa', slug: 'drone-nong-nghiep', description: 'Máy bay nông nghiệp phun thuốc sâu, sạ phân, rải hạt DJI T40/T50' },
    { name: 'Máy cấy lúa tự động', slug: 'may-cay-lua', description: 'Máy cấy mạ khay tự động thẳng hàng, tiết kiệm giống' },
    { name: 'Máy kéo & Vận chuyển', slug: 'may-keo', description: 'Xe kéo lúa, vận chuyển nông sản tận ghe/kho' },
    { name: 'Máy sấy nông sản', slug: 'may-say', description: 'Lò sấy lúa vỉ ngang, sấy tháp công nghiệp' },
  ];

  const categories = [];
  for (const catDef of categoryDefs) {
    let cat = await Category.findOne({ slug: catDef.slug });
    if (!cat) {
      cat = await Category.create(catDef);
    }
    categories.push(cat);
  }

  const catMap = {};
  categories.forEach(c => { catMap[c.slug] = c._id; });

  // 4. Danh sách máy mẫu chất lượng cao phong phú cho 11 huyện An Giang
  const sampleMachineTemplates = [
    {
      name: 'Máy gặt đập Kubota DC-70G Plus (Chuyên lầy An Giang)',
      catSlug: 'may-gat-dap',
      brand: 'Kubota',
      year_made: 2023,
      price_per_day: 1500000,
      price_max: 1800000,
      allow_negotiation: true,
      discount_long_term: 10,
      min_days_for_discount: 3,
      discount_combo: 5,
      image_url: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800',
      district: 'Thoại Sơn',
      addons: [
        { name: '👨‍🌾 Kèm thợ lái máy tay nghề cao', price: 200000, unit: 'ngày', description: 'Thợ gặt kinh nghiệm 10 năm lội lầy' },
        { name: '⛽ Bao 100% dầu DO vận hành', price: 150000, unit: 'ngày', description: 'Cung cấp đủ Dầu DO suốt ca gặt' },
      ]
    },
    {
      name: 'Máy bay Drone DJI Agras T40 (Sạ lúa & Phun thuốc 100ha/ngày)',
      catSlug: 'drone-nong-nghiep',
      brand: 'DJI',
      year_made: 2024,
      price_per_day: 1200000,
      price_max: 1400000,
      allow_negotiation: false,
      discount_long_term: 15,
      min_days_for_discount: 2,
      discount_combo: 10,
      image_url: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800',
      district: 'Tri Tôn',
      addons: [
        { name: '🚁 Đầu rải hạt sạ lúa chính hãng DJI', price: 100000, unit: 'ngày', description: 'Rải hạt mạ đều 100%' },
        { name: '🔋 Kèm 4 pin Lithium siêu nạp nhanh', price: 120000, unit: 'ngày', description: 'Đảm bảo bay liên tục 24/7' },
      ]
    },
    {
      name: 'Máy cày Yanmar YT5114 114 mã lực bánh xích kép',
      catSlug: 'may-cay',
      brand: 'Yanmar',
      year_made: 2022,
      price_per_day: 1300000,
      price_max: 1600000,
      allow_negotiation: true,
      discount_long_term: 8,
      min_days_for_discount: 3,
      discount_combo: 5,
      image_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800',
      district: 'Châu Phú',
      addons: [
        { name: '👨‍🌾 Kèm thợ cày xới đất chuyên nghiệp', price: 180000, unit: 'ngày' },
        { name: '🚚 Giao máy tận công ruộng', price: 100000, unit: 'chuyến' },
      ]
    },
    {
      name: 'Máy cấy mạ khay Yanmar VP6D (6 hàng cấy thẳng đứng)',
      catSlug: 'may-cay-lua',
      brand: 'Yanmar',
      year_made: 2023,
      price_per_day: 1100000,
      price_max: 1300000,
      allow_negotiation: false,
      discount_long_term: 10,
      min_days_for_discount: 4,
      discount_combo: 5,
      image_url: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=800',
      district: 'Chợ Mới',
      addons: [
        { name: '🌱 Kèm khai mạ giống chuẩn xát', price: 150000, unit: 'ngày' },
      ]
    },
    {
      name: 'Máy gặt lúa Yanmar AW82V gầm cao vượt lầy',
      catSlug: 'may-gat-dap',
      brand: 'Yanmar',
      year_made: 2023,
      price_per_day: 1600000,
      price_max: 1900000,
      allow_negotiation: true,
      discount_long_term: 12,
      min_days_for_discount: 3,
      discount_combo: 5,
      image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
      district: 'An Phú',
      addons: [
        { name: '👨‍🌾 Kèm thợ gặt lúa ngập nước', price: 250000, unit: 'ngày' },
      ]
    },
    {
      name: 'Drone Phun Thuốc DJI T50 Đời Mới Nhất 2025',
      catSlug: 'drone-nong-nghiep',
      brand: 'DJI',
      year_made: 2025,
      price_per_day: 1400000,
      price_max: 1700000,
      allow_negotiation: true,
      discount_long_term: 15,
      min_days_for_discount: 2,
      discount_combo: 10,
      image_url: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800',
      district: 'Long Xuyên',
      addons: [
        { name: '👨‍✈️ Kèm phi công Drone đạt chứng chỉ DJI', price: 250000, unit: 'ngày' },
        { name: '⛽ Bao trạm sạc pin phát điện D12000i', price: 200000, unit: 'ngày' },
      ]
    }
  ];

  // 5. Cập nhật & Bổ sung danh sách máy mà không làm mất máy cũ có ảnh đẹp của user
  let updatedCount = 0;
  const ownerVip = customUserMap['owner_vip@agrigo.vn'];
  const userHieu = customUserMap['lehieu17042004@gmail.com'];

  for (let i = 0; i < sampleMachineTemplates.length; i++) {
    const tpl = sampleMachineTemplates[i];
    const catId = catMap[tpl.catSlug] || categories[0]._id;
    const assignedOwner = i % 2 === 0 ? ownerVip : userHieu;

    let existing = await Machine.findOne({ name: tpl.name, owner_id: assignedOwner._id });
    if (!existing) {
      await Machine.create({
        owner_id: assignedOwner._id,
        category_id: catId,
        name: tpl.name,
        brand: tpl.brand,
        year_made: tpl.year_made,
        price_per_day: tpl.price_per_day,
        price_max: tpl.price_max,
        price_unit: 'ngày',
        allow_negotiation: tpl.allow_negotiation,
        discount_long_term: tpl.discount_long_term,
        min_days_for_discount: tpl.min_days_for_discount,
        discount_combo: tpl.discount_combo,
        district: tpl.district,
        address_detail: `Xã trung tâm huyện ${tpl.district}, An Giang`,
        lat: 10.4 + (i * 0.05),
        lng: 105.1 + (i * 0.04),
        image_url: tpl.image_url,
        status: 'approved',
        rating_avg: 4.9,
        rating_count: 12 + i,
        addons: tpl.addons,
        available_start_date: '2026-08-01',
        available_end_date: '2026-11-30',
      });
      updatedCount++;
    } else {
      // Bảo tồn image_url cũ nếu đã được chỉnh sửa
      existing.price_max = tpl.price_max;
      existing.allow_negotiation = tpl.allow_negotiation;
      existing.discount_long_term = tpl.discount_long_term;
      existing.addons = tpl.addons;
      existing.status = 'approved';
      await existing.save();
    }
  }

  // 6. Đảm bảo tất cả máy đang chờ duyệt của userHieu & ownerVip được set status='approved' để test ngay
  await Machine.updateMany(
    { owner_id: { $in: [ownerVip._id, userHieu._id] }, status: 'pending' },
    { status: 'approved' }
  );

  console.log(`✅ Smart Seed hoàn tất thành công! Đã bảo tồn ảnh tùy chỉnh & tạo mới ${updatedCount} dàn máy cơ giới đa dạng.`);
  return { ok: true, preservedUsers: Object.keys(customUserMap), newMachinesCreated: updatedCount };
}

module.exports = { runSmartSeed };
