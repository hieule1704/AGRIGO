const mongoose = require('mongoose');

const AdvertisementSchema = new mongoose.Schema(
  {
    owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    machine_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Machine' },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    banner_url: { type: String, required: true },
    target_district: { type: String },
    status: { type: String, enum: ['active', 'expired', 'hidden'], default: 'active' },
    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    expires_at: { type: Date },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.model('Advertisement', AdvertisementSchema);
