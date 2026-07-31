const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

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
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    if (!user) return res.status(400).json({ error: 'Email hoặc mật khẩu không đúng.' });
    if (user.status === 'locked') return res.status(403).json({ error: 'Tài khoản đã bị khóa.' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(400).json({ error: 'Email hoặc mật khẩu không đúng.' });

    const token = signToken(user);
    res.json({ token, user: user.toSafeJSON() });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi máy chủ khi đăng nhập.', detail: err.message });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  res.json({ user: req.user.toSafeJSON() });
});

module.exports = router;
