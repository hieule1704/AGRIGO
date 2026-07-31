const router = require('express').Router();
const Machine = require('../models/Machine');
const Review = require('../models/Review');
const User = require('../models/User');
const { requireAuth, requireRole, optionalAuth } = require('../middleware/auth');

// GET /api/machines  (tim kiem cong khai)
// query: district, category, date (YYYY-MM-DD), sort=newest|price_asc|price_desc|rating
router.get('/', async (req, res) => {
  const { district, category, date, sort } = req.query;
  const filter = { status: 'approved' };
  if (district) filter.district = district;
  if (category) filter.category_id = category;

  let query = Machine.find(filter).populate('category_id', 'name slug');

  if (sort === 'price_asc') query = query.sort({ price_per_day: 1 });
  else if (sort === 'price_desc') query = query.sort({ price_per_day: -1 });
  else if (sort === 'rating') query = query.sort({ rating_avg: -1 });
  else query = query.sort({ created_at: -1 });

  let machines = await query.lean();

  // Loc theo ngay ranh lich (neu co chon ngay)
  if (date) {
    machines = machines.filter((m) => !(m.schedule || []).some((s) => s.date === date));
  }

  res.json({ machines });
});

// GET /api/machines/mine  (may cua chu may dang dang nhap) -- dat truoc /:id
router.get('/mine', requireAuth, requireRole('owner'), async (req, res) => {
  const machines = await Machine.find({ owner_id: req.user._id })
    .populate('category_id', 'name slug')
    .sort({ created_at: -1 });
  res.json({ machines });
});

// GET /api/machines/:id  (chi tiet + thong tin chu may + danh gia)
router.get('/:id', async (req, res) => {
  const machine = await Machine.findById(req.params.id).populate('category_id', 'name slug');
  if (!machine) return res.status(404).json({ error: 'Không tìm thấy máy.' });

  const owner = await User.findById(machine.owner_id);
  const reviews = await Review.find({ machine_id: machine._id })
    .populate('farmer_id', 'full_name')
    .sort({ created_at: -1 });

  res.json({
    machine,
    owner: owner ? { full_name: owner.full_name, phone: owner.phone, district: owner.district } : null,
    reviews,
  });
});

// POST /api/machines  (chu may dang may moi)
router.post('/', requireAuth, requireRole('owner'), async (req, res) => {
  try {
    const { category_id, name, description, brand, year_made, price_per_day, price_unit, district, address_detail, image_url } = req.body;
    if (!category_id || !name || !price_per_day || !district) {
      return res.status(400).json({ error: 'Vui lòng nhập đủ: loại máy, tên máy, giá/ngày, khu vực.' });
    }
    const machine = await Machine.create({
      owner_id: req.user._id,
      category_id, name, description, brand, year_made,
      price_per_day, price_unit: price_unit || 'ngày',
      district, address_detail, image_url,
      status: 'pending',
    });
    res.status(201).json({ machine });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi đăng máy.', detail: err.message });
  }
});

// PUT /api/machines/:id  (chu may sua may cua minh)
router.put('/:id', requireAuth, requireRole('owner'), async (req, res) => {
  const machine = await Machine.findById(req.params.id);
  if (!machine) return res.status(404).json({ error: 'Không tìm thấy máy.' });
  if (String(machine.owner_id) !== String(req.user._id)) {
    return res.status(403).json({ error: 'Bạn không sở hữu máy này.' });
  }
  const fields = ['name', 'description', 'brand', 'year_made', 'price_per_day', 'price_unit', 'district', 'address_detail', 'image_url', 'category_id'];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) machine[f] = req.body[f];
  });
  // Sua thong tin -> can duyet lai
  machine.status = 'pending';
  await machine.save();
  res.json({ machine });
});

// DELETE /api/machines/:id
router.delete('/:id', requireAuth, requireRole('owner'), async (req, res) => {
  const machine = await Machine.findById(req.params.id);
  if (!machine) return res.status(404).json({ error: 'Không tìm thấy máy.' });
  if (String(machine.owner_id) !== String(req.user._id)) {
    return res.status(403).json({ error: 'Bạn không sở hữu máy này.' });
  }
  await machine.deleteOne();
  res.json({ ok: true });
});

// POST /api/machines/:id/block-date  (chu may tu chan 1 ngay ban)
router.post('/:id/block-date', requireAuth, requireRole('owner'), async (req, res) => {
  const { date } = req.body;
  if (!date) return res.status(400).json({ error: 'Thiếu ngày cần chặn.' });
  const machine = await Machine.findById(req.params.id);
  if (!machine) return res.status(404).json({ error: 'Không tìm thấy máy.' });
  if (String(machine.owner_id) !== String(req.user._id)) {
    return res.status(403).json({ error: 'Bạn không sở hữu máy này.' });
  }
  if (!machine.schedule.some((s) => s.date === date)) {
    machine.schedule.push({ date, status: 'blocked' });
    await machine.save();
  }
  res.json({ machine });
});

module.exports = router;
