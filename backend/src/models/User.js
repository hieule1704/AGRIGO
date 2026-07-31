const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    full_name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password_hash: { type: String, required: true },
    phone: { type: String, trim: true },
    role: { type: String, enum: ['farmer', 'owner', 'admin'], default: 'farmer' },
    address: { type: String },
    district: { type: String },
    avatar_url: { type: String },
    status: { type: String, enum: ['active', 'locked'], default: 'active' },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// Khong bao gio tra password_hash ve client
UserSchema.methods.toSafeJSON = function () {
  const obj = this.toObject();
  delete obj.password_hash;
  return obj;
};

module.exports = mongoose.model('User', UserSchema);
