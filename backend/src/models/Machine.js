const mongoose = require('mongoose');

// Lich ban/ranh cua may theo tung ngay (embed truc tiep de truy van nhanh cho demo)
const ScheduleEntrySchema = new mongoose.Schema(
  {
    date: { type: String, required: true }, // 'YYYY-MM-DD'
    status: { type: String, enum: ['booked', 'blocked'], default: 'booked' },
  },
  { _id: false }
);

const MachineSchema = new mongoose.Schema(
  {
    owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    name: { type: String, required: true },
    description: { type: String },
    brand: { type: String },
    year_made: { type: Number },
    price_per_day: { type: Number, required: true },
    price_unit: { type: String, default: 'ngày' },
    district: { type: String, required: true },
    address_detail: { type: String },
    lat: { type: Number },
    lng: { type: Number },
    image_url: { type: String },
    images: [{ type: String }], // anh phu, de mo rong sau nay
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'hidden'], default: 'pending' },
    rating_avg: { type: Number, default: 0 },
    available_start_date: { type: String, default: '' },
    available_end_date: { type: String, default: '' },
    schedule: [ScheduleEntrySchema],
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

MachineSchema.index({ district: 1 });
MachineSchema.index({ category_id: 1 });
MachineSchema.index({ status: 1 });

module.exports = mongoose.model('Machine', MachineSchema);
