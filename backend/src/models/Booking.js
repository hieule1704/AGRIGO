const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
  {
    machine_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Machine', required: true },
    farmer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    start_date: { type: String, required: true }, // 'YYYY-MM-DD'
    end_date: { type: String, required: true },
    days: { type: Number, required: true },
    price_per_day: { type: Number, required: true },
    total_price: { type: Number, required: true },
    commission_rate: { type: Number, default: 0.05 },
    commission_amount: { type: Number, default: 0 },
    note: { type: String },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

BookingSchema.index({ machine_id: 1 });
BookingSchema.index({ farmer_id: 1 });
BookingSchema.index({ owner_id: 1 });

module.exports = mongoose.model('Booking', BookingSchema);
