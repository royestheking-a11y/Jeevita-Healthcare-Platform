import express from 'express';
import { Settings } from '../models/Settings.js';

const router = express.Router();

// Get setting by key
router.get('/:key', async (req, res) => {
  try {
    const setting = await Settings.findOne({ key: req.params.key });
    if (!setting) return res.json({ key: req.params.key, value: null });
    res.json(setting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Set setting
router.post('/:key', async (req, res) => {
  try {
    const setting = await Settings.findOneAndUpdate(
      { key: req.params.key },
      { value: req.body.value },
      { new: true, upsert: true }
    );
    res.json(setting);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all settings
router.get('/', async (req, res) => {
  try {
    const settings = await Settings.find();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

