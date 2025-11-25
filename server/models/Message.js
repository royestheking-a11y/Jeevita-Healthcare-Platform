import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  subject: { type: String },
  message: { type: String, required: true },
  phone: { type: String },
  timestamp: { type: String, required: true },
  status: { type: String, enum: ['unread', 'read'], default: 'unread' },
  source: { type: String, default: 'contact-form' },
  replies: [{
    admin: { type: Boolean, default: false },
    text: { type: String, required: true },
    timestamp: { type: String, required: true }
  }]
}, {
  timestamps: true
});

export const Message = mongoose.model('Message', messageSchema);

