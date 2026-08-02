const router = require('express').Router();
const Booking = require('../models/Booking');
const Machine = require('../models/Machine');
const Review = require('../models/Review');
const { requireAuth, requireRole } = require('../middleware/auth');

const COMMISSION_RATE = 0.05;

function dateRange(start, end) {
  const dates = [];
  let cur = new Date(start);
  const last = new Date(end);
  while (cur <= last) {
    dates.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

// POST /api/bookings  (nong dan dat lich)
router.post('/', requireAuth, requireRole('farmer'), async (req, res) => {
  try {
    const { machine_id, start_date, end_date, note, payment_method, payment_status, selected_addons, discount_amount, is_negotiated, negotiated_price, custom_total_price } = req.body;
    if (!machine_id || !start_date || !end_date) {
      return res.status(400).json({ error: 'Vui lòng chọn máy và ngày thuê.' });
    }
    const machine = await Machine.findById(machine_id);
    if (!machine || machine.status !== 'approved') {
      return res.status(404).json({ error: 'Máy không tồn tại hoặc chưa được duyệt.' });
    }

    if (new Date(start_date) > new Date(end_date)) {
      return res.status(400).json({ error: 'Ngày kết thúc phải từ hoặc sau ngày bắt đầu.' });
    }
    const days = dateRange(start_date, end_date);
    if (days.length < 1) return res.status(400).json({ error: 'Khoảng ngày không hợp lệ.' });

    const busy = new Set((machine.schedule || []).map((s) => s.date));
    const conflict = days.some((d) => busy.has(d));
    if (conflict) {
      return res.status(400).json({ error: 'Máy đã có lịch bận trong khoảng ngày bạn chọn. Vui lòng chọn ngày khác.' });
    }

    let baseRental = machine.price_per_day * days.length;
    let addonsTotal = 0;
    const addonsList = Array.isArray(selected_addons) ? selected_addons : [];
    addonsList.forEach((a) => {
      addonsTotal += (Number(a.price) || 0) * days.length;
    });

    const disc = Number(discount_amount) || 0;
    let finalTotal = custom_total_price ? Number(custom_total_price) : Math.max(0, baseRental + addonsTotal - disc);
    const commission_amount = Math.round(finalTotal * COMMISSION_RATE);

    const booking = await Booking.create({
      machine_id: machine._id,
      farmer_id: req.user._id,
      owner_id: machine.owner_id,
      start_date, end_date,
      days: days.length,
      price_per_day: machine.price_per_day,
      selected_addons: addonsList,
      discount_amount: disc,
      is_negotiated: !!is_negotiated,
      negotiated_price: Number(negotiated_price) || 0,
      total_price: finalTotal,
      commission_rate: COMMISSION_RATE,
      commission_amount,
      payment_method: payment_method || 'cash',
      payment_status: payment_status || 'completed',
      note,
      status: 'pending',
    });

    res.status(201).json({ booking });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi tạo lịch đặt.', detail: err.message });
  }
});

// GET /api/bookings/mine  (nong dan xem lich cua minh)
router.get('/mine', requireAuth, requireRole('farmer'), async (req, res) => {
  const bookings = await Booking.find({ farmer_id: req.user._id })
    .populate('machine_id', 'name image_url district price_per_day')
    .sort({ created_at: -1 });
  res.json({ bookings });
});

// GET /api/bookings/owner  (chu may xem cac don duoc dat)
router.get('/owner', requireAuth, requireRole('owner'), async (req, res) => {
  const bookings = await Booking.find({ owner_id: req.user._id })
    .populate('machine_id', 'name image_url district')
    .populate('farmer_id', 'full_name phone district')
    .sort({ created_at: -1 });
  res.json({ bookings });
});

// PATCH /api/bookings/:id/status  (chu may: accepted/rejected/completed/cancelled | nong dan: cancelled)
router.patch('/:id/status', requireAuth, async (req, res) => {
  const { status } = req.body;
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Không tìm thấy đơn.' });

  const isOwner = String(booking.owner_id) === String(req.user._id);
  const isFarmer = String(booking.farmer_id) === String(req.user._id);
  const prevStatus = booking.status;

  if (isOwner && ['accepted', 'rejected', 'completed', 'cancelled'].includes(status)) {
    if (status === 'accepted') {
      const machine = await Machine.findById(booking.machine_id);
      if (!machine) return res.status(404).json({ error: 'Không tìm thấy máy.' });
      const days = dateRange(booking.start_date, booking.end_date);
      const busy = new Set((machine.schedule || []).filter((s) => s.status === 'booked' || s.status === 'blocked').map((s) => s.date));
      const conflict = days.some((d) => busy.has(d));
      if (conflict) {
        return res.status(400).json({ error: 'Máy đã có lịch bận trong khoảng thời gian này. Không thể nhận đơn.' });
      }
      days.forEach((d) => {
        machine.schedule.push({ date: d, status: 'booked' });
      });
      await machine.save();
    } else if (['cancelled', 'rejected'].includes(status) && prevStatus === 'accepted') {
      const machine = await Machine.findById(booking.machine_id);
      if (machine && machine.schedule) {
        const days = new Set(dateRange(booking.start_date, booking.end_date));
        machine.schedule = machine.schedule.filter((s) => !(days.has(s.date) && s.status === 'booked'));
        await machine.save();
      }
    }
    booking.status = status;
  } else if (isFarmer && status === 'cancelled' && ['pending', 'accepted'].includes(prevStatus)) {
    if (prevStatus === 'accepted') {
      const machine = await Machine.findById(booking.machine_id);
      if (machine && machine.schedule) {
        const days = new Set(dateRange(booking.start_date, booking.end_date));
        machine.schedule = machine.schedule.filter((s) => !(days.has(s.date) && s.status === 'booked'));
        await machine.save();
      }
    }
    booking.status = 'cancelled';
  } else {
    return res.status(403).json({ error: 'Bạn không thể thực hiện thao tác này trên đơn hàng.' });
  }

  await booking.save();
  res.json({ booking });
});

// POST /api/bookings/:id/review  (nong dan danh gia sau khi hoan tat)
router.post('/:id/review', requireAuth, requireRole('farmer'), async (req, res) => {
  const { rating, comment } = req.body;
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Không tìm thấy đơn.' });
  if (String(booking.farmer_id) !== String(req.user._id)) return res.status(403).json({ error: 'Không có quyền.' });
  if (booking.status !== 'completed') return res.status(400).json({ error: 'Chỉ đánh giá được sau khi đơn hoàn tất.' });

  const already = await Review.findOne({ booking_id: booking._id });
  if (already) return res.status(400).json({ error: 'Bạn đã đánh giá đơn này rồi.' });

  const review = await Review.create({
    booking_id: booking._id,
    machine_id: booking.machine_id,
    farmer_id: req.user._id,
    rating, comment,
  });

  const machine = await Machine.findById(booking.machine_id);
  const newCount = machine.rating_count + 1;
  const newAvg = (machine.rating_avg * machine.rating_count + Number(rating)) / newCount;
  machine.rating_avg = Number(newAvg.toFixed(2));
  machine.rating_count = newCount;
  await machine.save();

  res.status(201).json({ review });
});

module.exports = router;
