import express from 'express';
import { RefundRequest } from '../models/RefundRequest.js';

const router = express.Router();

// Get all refund requests
router.get('/', async (req, res) => {
  try {
    const refunds = await RefundRequest.find().sort({ createdAt: -1 });
    res.json(refunds);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get refund by ID
router.get('/:id', async (req, res) => {
  try {
    const refund = await RefundRequest.findById(req.params.id);
    if (!refund) return res.status(404).json({ error: 'Refund request not found' });
    res.json(refund);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create refund request
router.post('/', async (req, res) => {
  try {
    const refund = new RefundRequest(req.body);
    await refund.save();
    res.status(201).json(refund);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update refund request
router.put('/:id', async (req, res) => {
  try {
    const refund = await RefundRequest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!refund) return res.status(404).json({ error: 'Refund request not found' });
    res.json(refund);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete refund request
router.delete('/:id', async (req, res) => {
  try {
    const refund = await RefundRequest.findByIdAndDelete(req.params.id);
    if (!refund) return res.status(404).json({ error: 'Refund request not found' });
    res.json({ message: 'Refund request deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

