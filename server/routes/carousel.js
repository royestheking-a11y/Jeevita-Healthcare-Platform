import express from 'express';
import { CarouselSlide } from '../models/CarouselSlide.js';
import { deleteImage } from '../utils/cloudinary.js';

const router = express.Router();

// Get all carousel slides
router.get('/', async (req, res) => {
  try {
    const slides = await CarouselSlide.find();
    res.json(slides);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get slide by ID
router.get('/:id', async (req, res) => {
  try {
    const slide = await CarouselSlide.findById(req.params.id);
    if (!slide) return res.status(404).json({ error: 'Slide not found' });
    res.json(slide);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create slide
router.post('/', async (req, res) => {
  try {
    const slide = new CarouselSlide(req.body);
    await slide.save();
    res.status(201).json(slide);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update slide
router.put('/:id', async (req, res) => {
  try {
    // Get existing slide to check for image change
    const existingSlide = await CarouselSlide.findById(req.params.id);
    if (!existingSlide) return res.status(404).json({ error: 'Slide not found' });

    // If image is being replaced, delete old one from Cloudinary
    if (req.body.image && existingSlide.image &&
      req.body.image !== existingSlide.image &&
      existingSlide.image.includes('cloudinary.com')) {
      await deleteImage(existingSlide.image);
    }

    const slide = await CarouselSlide.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(slide);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete slide
router.delete('/:id', async (req, res) => {
  try {
    const slide = await CarouselSlide.findByIdAndDelete(req.params.id);
    if (!slide) return res.status(404).json({ error: 'Slide not found' });

    // Delete image from Cloudinary
    if (slide.image && slide.image.includes('cloudinary.com')) {
      await deleteImage(slide.image);
    }

    res.json({ message: 'Slide deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
