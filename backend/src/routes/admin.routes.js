const router = require('express').Router();
const User = require('../models/User');
const Machine = require('../models/Machine');
const Booking = require('../models/Booking');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth, requireRole('admin'));

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  const [userCount, farmerCount, ownerCount, machineCount, pendingMachines, bookingCount, completedBookings] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'farmer' }),
    User.countDocuments({ role: 'owner' }),
    Machine.countDocuments(),
    Machine.countDocuments({ status: 'pending' }),
    Booking.countDocuments(),
    Booking.find({ status: 'completed' }),
  ]);

  const revenue = completedBookings.reduce((sum, b) => sum + b.total_price, 0);
  const commission = completedBookings.reduce((sum, b) => sum + b.commission_amount, 0);

  res.json({
    userCount, farmerCount, ownerCount, machineCount, pendingMachines,
    bookingCount, completedCount: completedBookings.length,
    revenue, commission,
  });
});

// GET /api/admin/machines?status=pending
router.get('/machines', async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  const machines = await Machine.find(filter)
    .populate('category_id', 'name')
    .populate('owner_id', 'full_name email phone')
    .sort({ created_at: -1 });
  res.json({ machines });
});

// PATCH /api/admin/machines/:id/status  { status: approved|rejected|hidden|pending }
router.patch('/machines/:id/status', async (req, res) => {
  const { status } = req.body;
  if (!['pending', 'approved', 'rejected', 'hidden'].includes(status)) {
    return res.status(400).json({ error: 'Trạng thái không hợp lệ.' });
  }
  const machine = await Machine.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!machine) return res.status(404).json({ error: 'Không tìm thấy máy.' });
  res.json({ machine });
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  const users = await User.find().select('-password_hash').sort({ created_at: -1 });
  res.json({ users });
});

// PATCH /api/admin/users/:id/status  { status: active|locked }
router.patch('/users/:id/status', async (req, res) => {
  const { status } = req.body;
  if (!['active', 'locked'].includes(status)) return res.status(400).json({ error: 'Trạng thái không hợp lệ.' });
  const targetUser = await User.findById(req.params.id);
  if (!targetUser) return res.status(404).json({ error: 'Không tìm thấy người dùng.' });
  if (targetUser.role === 'admin') {
    return res.status(403).json({ error: 'Không thể thay đổi trạng thái tài khoản có quyền Admin.' });
  }
  targetUser.status = status;
  await targetUser.save();
  const user = targetUser.toObject();
  delete user.password_hash;
  res.json({ user });
});

// PUT /api/admin/machines/:id (Admin sua thong tin chuyen sau cua may)
router.put('/machines/:id', async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id);
    if (!machine) return res.status(404).json({ error: 'Không tìm thấy máy.' });

    const fields = ['name', 'description', 'brand', 'year_made', 'price_per_day', 'price_unit', 'district', 'address_detail', 'lat', 'lng', 'image_url', 'category_id', 'status'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) machine[f] = req.body[f];
    });

    await machine.save();
    const updated = await Machine.findById(machine._id)
      .populate('category_id', 'name')
      .populate('owner_id', 'full_name email phone');
    res.json({ machine: updated });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi chỉnh sửa máy.', detail: err.message });
  }
});

// DELETE /api/admin/machines/:id (Admin xoa may)
router.delete('/machines/:id', async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id);
    if (!machine) return res.status(404).json({ error: 'Không tìm thấy máy.' });
    await machine.deleteOne();
    res.json({ ok: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi xóa máy.', detail: err.message });
  }
});

// PUT /api/admin/users/:id (Admin sua thong tin nguoi dung & toggle VIP)
router.put('/users/:id', async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ error: 'Không tìm thấy người dùng.' });

    const fields = ['full_name', 'phone', 'district', 'address', 'role', 'status', 'is_premium', 'avatar_url'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) targetUser[f] = req.body[f];
    });

    if (req.body.is_premium === true && !targetUser.premium_expires_at) {
      targetUser.premium_expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }

    await targetUser.save();
    res.json({ user: targetUser.toSafeJSON() });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi cập nhật người dùng.', detail: err.message });
  }
});

// DELETE /api/admin/users/:id (Admin xoa tai khoan)
router.delete('/users/:id', async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ error: 'Không tìm thấy người dùng.' });
    if (targetUser.role === 'admin') return res.status(403).json({ error: 'Không thể xóa tài khoản Admin.' });
    await targetUser.deleteOne();
    res.json({ ok: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi xóa người dùng.' });
  }
});

// GET /api/admin/bookings (Admin lay danh sach tat ca don dat)
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('machine_id', 'name district price_per_day')
      .populate('farmer_id', 'full_name phone district email')
      .populate('owner_id', 'full_name phone email')
      .sort({ created_at: -1 })
      .limit(200);
    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi tải danh sách đơn hàng.', detail: err.message });
  }
});

// PATCH /api/admin/bookings/:id/status (Admin doi trang thai don hang)
router.patch('/bookings/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!booking) return res.status(404).json({ error: 'Không tìm thấy đơn hàng.' });
    res.json({ booking });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi cập nhật trạng thái đơn.' });
  }
});

// DELETE /api/admin/bookings/:id (Admin xoa don hang)
router.delete('/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Không tìm thấy đơn hàng.' });
    await booking.deleteOne();
    res.json({ ok: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi xóa đơn hàng.' });
  }
});

module.exports = router;
