const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Machine = require('./models/Machine');
const Category = require('./models/Category');
const Booking = require('./models/Booking');
const Review = require('./models/Review');

const AUTHENTIC_COMMENTS = [
  "Máy gặt đập liên hợp chạy êm ru, gặt lúa ngã rất sạch không bị thất thoát hạt nào. Chủ máy nhiệt tình, 6h sáng đã có mặt tại đầu bờ ruộng. 5 sao cho chất lượng!",
  "Thuê máy cày xới đất sâu và tơi xốp, làm 30 công đất trong ngày là xong xuôi. Mùa vụ tới chắc chắn tiếp tục ủng hộ chủ máy!",
  "Dịch vụ Drone phun thuốc cực kỳ đều và nhanh, tiết kiệm được bao nhiêu công sức so với xịt tay thủ công. Đánh giá 5 sao!",
  "Chủ máy rất uy tín và đúng giờ. Máy móc đời mới hoạt động bền bỉ, tiết kiệm nhiên liệu. Có giảm giá chút đỉnh cho bà con thuê dài ngày.",
  "Máy cấy mạ khay cấy thẳng tắp, mạ bén rễ rất nhanh. Cả ấp ai đi ngang qua ruộng cũng tấm tắc khen đẹp.",
  "Đã thuê 3 lần qua AGRIGO của chủ này, lần nào cũng chu đáo và hướng dẫn kỹ lưỡng. Thanh toán QR nhanh gọn, minh bạch.",
  "Máy xới đất bánh xích đôi đi đầm lầy cực tốt, không lo bị lún thụt mùa mưa lũ. Rất hài lòng với chất lượng phục vụ.",
  "Bác tài lái máy rất lành nghề, đường cày thẳng tắp, bờ ruộng vuông vức gọn gàng. Hẹn mùa thu hoạch tới lại gọi tiếp nhé!",
  "Drone rải hạt giống và sạ phân rất đều tay, mật độ lúa mọc lên chuẩn chỉ. Thời gian hoàn thành vượt tiến độ cam kết.",
  "Máy móc bảo dưỡng tốt, không bị sự cố hỏng vặt giữa chừng. Giá cả niêm yết rõ ràng, không phát sinh chi phí vô lý.",
  "Thuê máy cuộn rơm sau mùa gặt thu gom nhanh gọn lẹ, rơm cuộn chặt xuất bán cho các trại bò được giá cao.",
  "Chủ máy thân thiện, dễ thương, hỗ trợ đưa máy tận chân ruộng xa hẻo lánh. Cho 5 sao không ngần ngại!"
];

async function populateRichData() {
  console.log('🚀 Kết nối tới MongoDB Cloud Atlas để nạp dữ liệu phong phú...');
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/agrigo';
  await mongoose.connect(mongoUri);
  console.log('✅ Đã kết nối MongoDB thành công!');

  const passwordHash = await bcrypt.hash('123456', 10);

  // 1. Khởi tạo/Cập nhật tài khoản chính farmer_demo@agrigo.vn
  let farmerDemo = await User.findOne({ email: 'farmer_demo@agrigo.vn' });
  if (!farmerDemo) {
    farmerDemo = await User.create({
      full_name: 'Nguyễn Văn Nông (Farmer Demo)',
      email: 'farmer_demo@agrigo.vn',
      phone: '0912345678',
      password_hash: passwordHash,
      role: 'farmer',
      district: 'Chợ Mới',
      address: 'Ấp Long Bình, Xã Long Kiên, Huyện Chợ Mới, An Giang',
      avatar_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200',
      status: 'active',
    });
    console.log('👤 Đã tạo mới tài khoản demo: farmer_demo@agrigo.vn / 123456');
  } else {
    farmerDemo.password_hash = passwordHash;
    farmerDemo.role = 'farmer';
    farmerDemo.status = 'active';
    await farmerDemo.save();
    console.log('👤 Đã cập nhật mật khẩu 123456 cho tài khoản: farmer_demo@agrigo.vn');
  }

  // 2. Tạo thêm danh sách nông dân đa dạng để review và đặt lịch
  const farmerProfiles = [
    { name: 'Chú Ba Nông Dân', email: 'ba_nongdan@agrigo.vn', phone: '0939112233', district: 'Thoại Sơn' },
    { name: 'Anh Tư Lúa Vàng', email: 'tu_ruong@agrigo.vn', phone: '0978223344', district: 'Tri Tôn' },
    { name: 'Bác Sáu Đồng Tháp', email: 'sau_drone@agrigo.vn', phone: '0981334455', district: 'Tân Châu' },
    { name: 'Chú Tám Ruộng', email: 'tam_lua@agrigo.vn', phone: '0909445566', district: 'Châu Phú' },
    { name: 'Anh Hai Cơ Giới', email: 'hai_cay@agrigo.vn', phone: '0918556677', district: 'Long Xuyên' },
    { name: 'Cô Chín Vụ Mùa', email: 'chin_gat@agrigo.vn', phone: '0922667788', district: 'Chợ Mới' },
    { name: 'Chú Bảy Phú Tân', email: 'bay_nongnghiep@agrigo.vn', phone: '0933778899', district: 'Phú Tân' },
    { name: 'Em Út Nông Nghiệp', email: 'ut_dongruong@agrigo.vn', phone: '0944889900', district: 'Tịnh Biên' },
  ];

  const allFarmers = [farmerDemo];
  for (const fp of farmerProfiles) {
    let f = await User.findOne({ email: fp.email });
    if (!f) {
      f = await User.create({
        full_name: fp.name,
        email: fp.email,
        phone: fp.phone,
        password_hash: passwordHash,
        role: 'farmer',
        district: fp.district,
        address: `Ấp trung tâm, Huyện ${fp.district}, An Giang`,
        status: 'active',
      });
      console.log(`🌾 Đã tạo nông dân: ${fp.name} (${fp.email})`);
    }
    allFarmers.push(f);
  }

  // 3. Lấy danh sách máy đang có trong database
  const machines = await Machine.find({});
  console.log(`🚜 Tìm thấy tổng cộng ${machines.length} máy nông nghiệp trong cơ sở dữ liệu.`);

  if (machines.length === 0) {
    console.log('⚠️ Không có máy nào để tạo giao dịch.');
    process.exit(0);
  }

  // 4. Tạo các đơn đặt lịch (Bookings) phong phú cho tài khoản farmer_demo@agrigo.vn
  console.log('📦 Đang tạo các đơn đặt lịch & lịch sử thuê máy cho farmer_demo@agrigo.vn...');
  const demoBookingDates = [
    { start: '2026-06-10', end: '2026-06-12', days: 3, status: 'completed', payStatus: 'completed', method: 'qr' },
    { start: '2026-06-25', end: '2026-06-27', days: 3, status: 'completed', payStatus: 'completed', method: 'ewallet' },
    { start: '2026-07-05', end: '2026-07-08', days: 4, status: 'completed', payStatus: 'completed', method: 'qr' },
    { start: '2026-07-18', end: '2026-07-20', days: 3, status: 'completed', payStatus: 'completed', method: 'cash' },
    { start: '2026-08-02', end: '2026-08-04', days: 3, status: 'completed', payStatus: 'completed', method: 'qr' },
    { start: '2026-08-14', end: '2026-08-16', days: 3, status: 'accepted', payStatus: 'completed', method: 'qr' },
    { start: '2026-08-20', end: '2026-08-22', days: 3, status: 'accepted', payStatus: 'completed', method: 'ewallet' },
    { start: '2026-08-28', end: '2026-08-30', days: 3, status: 'pending', payStatus: 'pending', method: 'cash' },
  ];

  let farmerDemoBookingsCount = 0;
  for (let i = 0; i < demoBookingDates.length; i++) {
    const bInfo = demoBookingDates[i];
    const targetMachine = machines[i % machines.length];
    
    // Kiểm tra xem đã có booking trùng lặp chưa
    const existing = await Booking.findOne({
      farmer_id: farmerDemo._id,
      machine_id: targetMachine._id,
      start_date: bInfo.start,
    });

    if (!existing) {
      const totalPrice = targetMachine.price_per_day * bInfo.days;
      const newBooking = await Booking.create({
        machine_id: targetMachine._id,
        farmer_id: farmerDemo._id,
        owner_id: targetMachine.owner_id,
        start_date: bInfo.start,
        end_date: bInfo.end,
        days: bInfo.days,
        price_per_day: targetMachine.price_per_day,
        total_price: totalPrice,
        commission_rate: 0.05,
        commission_amount: Math.round(totalPrice * 0.05),
        payment_method: bInfo.method,
        payment_status: bInfo.payStatus,
        selected_addons: targetMachine.addons && targetMachine.addons.length > 0 ? [targetMachine.addons[0]] : [],
        status: bInfo.status,
        note: `Đơn đặt phục vụ mùa vụ của bác Ba Nông Dân (${targetMachine.district})`,
      });
      farmerDemoBookingsCount++;

      // Nếu đơn đã completed, thêm đánh giá review từ farmer_demo
      if (bInfo.status === 'completed') {
        const hasRev = await Review.findOne({ booking_id: newBooking._id });
        if (!hasRev) {
          await Review.create({
            booking_id: newBooking._id,
            machine_id: targetMachine._id,
            farmer_id: farmerDemo._id,
            rating: 5,
            comment: AUTHENTIC_COMMENTS[i % AUTHENTIC_COMMENTS.length],
          });
        }
      }
    }
  }
  console.log(`✅ Đã tạo/đồng bộ ${farmerDemoBookingsCount} đơn đặt lịch thực tế cho farmer_demo@agrigo.vn`);

  // 5. Tạo đánh giá (Reviews) phong phú, sôi động cho TẤT CẢ các máy
  console.log('⭐ Đang tạo đánh giá & bình luận chân thực cho toàn bộ các máy nông nghiệp...');
  let totalReviewsCreated = 0;

  for (let mIdx = 0; mIdx < machines.length; mIdx++) {
    const m = machines[mIdx];
    const currentReviewCount = await Review.countDocuments({ machine_id: m._id });

    // Tạo thêm từ 2 đến 5 đánh giá cho máy nếu chưa có đủ
    const targetCount = 3 + (mIdx % 4); // Mỗi máy có từ 3 đến 6 đánh giá
    const needed = Math.max(0, targetCount - currentReviewCount);

    for (let r = 0; r < needed; r++) {
      const reviewingFarmer = allFarmers[(mIdx + r + 1) % allFarmers.length];
      
      // Tạo 1 completed booking hợp lệ làm căn cứ đánh giá
      const pastStart = `2026-0${5 + (r % 3)}-${String(10 + ((mIdx + r * 5) % 18)).padStart(2, '0')}`;
      const pastEnd = `2026-0${5 + (r % 3)}-${String(12 + ((mIdx + r * 5) % 18)).padStart(2, '0')}`;
      
      const b = await Booking.create({
        machine_id: m._id,
        farmer_id: reviewingFarmer._id,
        owner_id: m.owner_id,
        start_date: pastStart,
        end_date: pastEnd,
        days: 2,
        price_per_day: m.price_per_day,
        total_price: m.price_per_day * 2,
        commission_rate: 0.05,
        commission_amount: Math.round(m.price_per_day * 2 * 0.05),
        payment_method: r % 2 === 0 ? 'qr' : 'cash',
        payment_status: 'completed',
        status: 'completed',
        note: 'Đơn hoàn tất thu hoạch mùa vụ.',
      });

      const ratingScore = r === 2 && mIdx % 5 === 0 ? 4 : 5; // 90% 5 sao, 10% 4 sao
      const commentText = AUTHENTIC_COMMENTS[(mIdx * 3 + r) % AUTHENTIC_COMMENTS.length];

      await Review.create({
        booking_id: b._id,
        machine_id: m._id,
        farmer_id: reviewingFarmer._id,
        rating: ratingScore,
        comment: commentText,
      });

      totalReviewsCreated++;
    }

    // Tính lại rating trung bình và tổng số đánh giá của máy
    const machineReviews = await Review.find({ machine_id: m._id });
    if (machineReviews.length > 0) {
      const sum = machineReviews.reduce((acc, cur) => acc + cur.rating, 0);
      const avg = Math.round((sum / machineReviews.length) * 10) / 10;
      m.rating_avg = avg;
      m.rating_count = machineReviews.length;
      await m.save();
    }
  }

  console.log(`🎉 HOÀN TẤT NẠP DỮ LIỆU!`);
  console.log(`📊 Đã tạo thêm ${totalReviewsCreated} đánh giá & bình luận mới trên toàn bộ hệ thống.`);
  console.log(`🔐 Tài khoản Demo: farmer_demo@agrigo.vn / 123456 (Đã có sẵn ${farmerDemoBookingsCount} đơn thuê máy & lịch sử giao dịch).`);

  await mongoose.disconnect();
  console.log('👋 Đã ngắt kết nối database an toàn 100%.');
}

populateRichData().catch((err) => {
  console.error('❌ Lỗi khi nạp dữ liệu:', err);
  process.exit(1);
});
