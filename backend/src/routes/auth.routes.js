const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// Rate limiter cho dang nhap - gioi han 10 lan trong 15 phut
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau 15 phút.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { full_name, email, password, phone, district, role } = req.body;
    if (!full_name || !email || !password) {
      return res.status(400).json({ error: 'Vui lòng nhập đầy đủ họ tên, email, mật khẩu.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự.' });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ error: 'Email này đã được đăng ký.' });

    const allowedRole = ['farmer', 'owner'].includes(role) ? role : 'farmer';
    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      full_name,
      email: email.toLowerCase(),
      password_hash,
      phone,
      district,
      role: allowedRole,
    });

    const token = signToken(user);
    res.status(201).json({ token, user: user.toSafeJSON() });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi máy chủ khi đăng ký.', detail: err.message });
  }
});

// POST /api/auth/login
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    if (!user) return res.status(400).json({ error: 'Email hoặc mật khẩu không đúng.' });
    if (user.status === 'locked') return res.status(403).json({ error: 'Tài khoản đã bị khóa.' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(400).json({ error: 'Email hoặc mật khẩu không đúng.' });

    // Tu dong cap nhat het han Premium neu da past premium_expires_at
    if (user.is_premium && user.premium_expires_at && new Date(user.premium_expires_at) < new Date()) {
      user.is_premium = false;
      await user.save();
    }

    const token = signToken(user);
    res.json({ token, user: user.toSafeJSON() });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi máy chủ khi đăng nhập.', detail: err.message });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  const user = req.user;
  if (user.is_premium && user.premium_expires_at && new Date(user.premium_expires_at) < new Date()) {
    user.is_premium = false;
    await user.save();
  }
  res.json({ user: user.toSafeJSON() });
});

// PUT /api/auth/profile (Cap nhat ho so & avatar)
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { full_name, phone, district, address, avatar_url } = req.body;
    const user = req.user;
    if (full_name !== undefined) user.full_name = full_name;
    if (phone !== undefined) user.phone = phone;
    if (district !== undefined) user.district = district;
    if (address !== undefined) user.address = address;
    if (avatar_url !== undefined) user.avatar_url = avatar_url;
    await user.save();
    res.json({ user: user.toSafeJSON() });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi cập nhật hồ sơ.', detail: err.message });
  }
});

module.exports = router;
