import express from 'express';
import { Medicine } from '../models/Medicine.js';
import { deleteImage } from '../utils/cloudinary.js';

const router = express.Router();

// Get all medicines
router.get('/', async (req, res) => {
  try {
    const medicines = await Medicine.find();
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get medicine by ID
router.get('/:id', async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) return res.status(404).json({ error: 'Medicine not found' });
    res.json(medicine);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create medicine
router.post('/', async (req, res) => {
  try {
    const medicine = new Medicine(req.body);
    await medicine.save();
    res.status(201).json(medicine);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update medicine
router.put('/:id', async (req, res) => {
  try {
    // Get existing medicine to check for image change
    const existingMedicine = await Medicine.findById(req.params.id);
    if (!existingMedicine) return res.status(404).json({ error: 'Medicine not found' });

    // If image is being replaced, delete old one from Cloudinary
    if (req.body.image && existingMedicine.image &&
      req.body.image !== existingMedicine.image &&
      existingMedicine.image.includes('cloudinary.com')) {
      await deleteImage(existingMedicine.image);
    }

    const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(medicine);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete medicine
router.delete('/:id', async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndDelete(req.params.id);
    if (!medicine) return res.status(404).json({ error: 'Medicine not found' });

    // Delete image from Cloudinary
    if (medicine.image && medicine.image.includes('cloudinary.com')) {
      await deleteImage(medicine.image);
    }

    res.json({ message: 'Medicine deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
