const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  icon: { type: String, default: '🧰' },
  description: { type: String },
});

module.exports = mongoose.model('Category', CategorySchema);
