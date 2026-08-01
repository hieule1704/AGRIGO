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

// GET /api/admin/bookings
router.get('/bookings', async (req, res) => {
  const bookings = await Booking.find()
    .populate('machine_id', 'name district')
    .populate('farmer_id', 'full_name')
    .populate('owner_id', 'full_name')
    .sort({ created_at: -1 })
    .limit(200);
  res.json({ bookings });
});

module.exports = router;
