import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
  phone: { type: String },
  dateOfBirth: { type: String },
  bio: { type: String },
  profileImage: { type: String },
  addresses: [{
    id: String,
    name: String,
    phone: String,
    address: String,
    city: String,
    area: String,
    isDefault: Boolean
  }]
}, {
  timestamps: true
});

export const User = mongoose.model('User', userSchema);

