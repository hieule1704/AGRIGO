const router = require('express').Router();
const User = require('../models/User');
const Machine = require('../models/Machine');
const Booking = require('../models/Booking');
const Category = require('../models/Category');
const Advertisement = require('../models/Advertisement');
const { requireAuth, requireRole } = require('../middleware/auth');

// All routes require Owner role
router.use(requireAuth, requireRole('owner'));

// POST /api/owner/subscribe-premium (Kich hoat / Gia han goi Premium VIP 30 ngay)
router.post('/subscribe-premium', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'Không tìm thấy người dùng.' });

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    user.is_premium = true;
    user.premium_expires_at = expiresAt;
    await user.save();

    res.json({
      ok: true,
      message: 'Đã kích hoạt thành công Gói Chủ Máy Premium 30 ngày!',
      user: user.toSafeJSON(),
    });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi nâng cấp Premium.', detail: err.message });
  }
});

// GET /api/owner/analytics (Phan tich du lieu thi truong chuyen sau - Premium Only)
router.get('/analytics', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.is_premium) {
      return res.status(403).json({
        error: 'Tính năng Phân tích dữ liệu thị trường chỉ dành riêng cho Chủ máy VIP Premium.',
        require_premium: true,
      });
    }

    // 1. Nhu cau thue theo khu vuc (So luong don dat + Tong doanh thu theo tung Huyen)
    const bookingsByDistrict = await Booking.aggregate([
      { $match: { status: { $in: ['accepted', 'completed'] } } },
      {
        $lookup: {
          from: 'machines',
          localField: 'machine_id',
          foreignField: '_id',
          as: 'machine',
        },
      },
      { $unwind: '$machine' },
      {
        $group: {
          _id: '$machine.district',
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: '$total_price' },
        },
      },
      { $sort: { totalBookings: -1 } },
    ]);

    // 2. So sanh gia thue trung binh thi truong voi gia thue cua Chu may
    const categories = await Category.find();
    const priceComparison = [];

    for (const cat of categories) {
      const avgMarket = await Machine.aggregate([
        { $match: { category_id: cat._id, status: 'approved' } },
        { $group: { _id: null, avgPrice: { $avg: '$price_per_day' }, count: { $sum: 1 } } },
      ]);

      const myMachines = await Machine.find({ owner_id: user._id, category_id: cat._id });
      const myAvgPrice = myMachines.length
        ? Math.round(myMachines.reduce((acc, m) => acc + m.price_per_day, 0) / myMachines.length)
        : 0;

      priceComparison.push({
        category_name: cat.name,
        category_slug: cat.slug,
        marketAvgPrice: avgMarket.length ? Math.round(avgMarket[0].avgPrice) : 0,
        marketTotalMachines: avgMarket.length ? avgMarket[0].count : 0,
        myAvgPrice,
        myMachineCount: myMachines.length,
      });
    }

    // 3. Tong quan hieu suat cua rieng Chu may
    const myMachinesCount = await Machine.countDocuments({ owner_id: user._id });
    const myBookingsCount = await Booking.countDocuments({ owner_id: user._id });

    res.json({
      analytics: {
        bookingsByDistrict,
        priceComparison,
        myMachinesCount,
        myBookingsCount,
        updated_at: new Date(),
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi tải dữ liệu phân tích.', detail: err.message });
  }
});

// GET /api/owner/advertisements (Danh sach quang cao cua chu may)
router.get('/advertisements', async (req, res) => {
  try {
    const ads = await Advertisement.find({ owner_id: req.user._id })
      .populate('machine_id', 'name image_url district price_per_day')
      .sort({ created_at: -1 });
    res.json({ advertisements: ads });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi tải danh sách quảng cáo.' });
  }
});

// POST /api/owner/advertisements (Tao bai quang cao banner - Premium Only)
router.post('/advertisements', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.is_premium) {
      return res.status(403).json({
        error: 'Tính năng đăng bài quảng cáo Banner chỉ dành riêng cho Chủ máy VIP Premium.',
        require_premium: true,
      });
    }

    const { title, description, banner_url, machine_id, target_district } = req.body;
    if (!title || !banner_url) {
      return res.status(400).json({ error: 'Vui lòng nhập tiêu đề và link hình ảnh Banner quảng cáo.' });
    }

    const ad = await Advertisement.create({
      owner_id: req.user._id,
      machine_id: machine_id || undefined,
      title,
      description,
      banner_url,
      target_district: target_district || undefined,
      status: 'active',
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    res.status(201).json({ advertisement: ad });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi tạo bài quảng cáo.', detail: err.message });
  }
});

// DELETE /api/owner/advertisements/:id (Xoa bai quang cao)
router.delete('/advertisements/:id', async (req, res) => {
  try {
    const ad = await Advertisement.findById(req.params.id);
    if (!ad) return res.status(404).json({ error: 'Không tìm thấy bài quảng cáo.' });
    if (String(ad.owner_id) !== String(req.user._id)) {
      return res.status(403).json({ error: 'Bạn không sở hữu bài quảng cáo này.' });
    }
    await ad.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi xóa bài quảng cáo.' });
  }
});

module.exports = router;
