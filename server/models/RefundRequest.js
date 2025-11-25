import mongoose from 'mongoose';

const refundRequestSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  orderType: { type: String, required: true },
  orderId: { type: String, required: true },
  amount: { type: Number, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  requestDate: { type: String, required: true },
  transactionId: { type: String, required: true }
}, {
  timestamps: true
});

export const RefundRequest = mongoose.model('RefundRequest', refundRequestSchema);

