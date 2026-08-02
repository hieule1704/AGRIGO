const router = require('express').Router();
const Advertisement = require('../models/Advertisement');

// GET /api/advertisements (Lay danh sach banner quang cao dang hoat dong)
router.get('/', async (req, res) => {
  try {
    const { district } = req.query;
    const filter = { status: 'active' };
    if (district) {
      filter.$or = [{ target_district: district }, { target_district: null }];
    }

    const ads = await Advertisement.find(filter)
      .populate('machine_id', 'name image_url district price_per_day price_unit rating_avg rating_count')
      .populate('owner_id', 'full_name is_premium phone district')
      .sort({ created_at: -1 })
      .limit(6);

    res.json({ advertisements: ads });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi tải danh sách quảng cáo.' });
  }
});

// POST /api/advertisements/:id/click (Tang so luot click)
router.post('/:id/click', async (req, res) => {
  try {
    await Advertisement.findByIdAndUpdate(req.params.id, { $inc: { clicks: 1 } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi ghi nhận click.' });
  }
});

module.exports = router;
