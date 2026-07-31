const router = require('express').Router();
const Category = require('../models/Category');

// GET /api/categories
router.get('/', async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  res.json({ categories });
});

module.exports = router;
