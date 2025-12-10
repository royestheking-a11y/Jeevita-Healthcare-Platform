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
    // Get existing slide to check for media change
    const existingSlide = await CarouselSlide.findById(req.params.id);
    if (!existingSlide) return res.status(404).json({ error: 'Slide not found' });

    // 1. Handle Image Deletion: If image changed
    if (req.body.image && existingSlide.image &&
      req.body.image !== existingSlide.image &&
      existingSlide.image.includes('cloudinary.com')) {
      await deleteImage(existingSlide.image, 'image');
    }

    // 2. Handle Video Deletion: 
    // If videoUrl changed OR videoType changed (e.g., from 'upload' to 'none' or 'youtube')
    // and the old one was an upload
    if (existingSlide.videoType === 'upload' && existingSlide.videoUrl &&
      (req.body.videoUrl !== existingSlide.videoUrl || req.body.videoType !== 'upload') &&
      existingSlide.videoUrl.includes('cloudinary.com')) {
      await deleteImage(existingSlide.videoUrl, 'video');
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
      await deleteImage(slide.image, 'image');
    }

    // Delete video from Cloudinary if it was uploaded
    if (slide.videoType === 'upload' && slide.videoUrl && slide.videoUrl.includes('cloudinary.com')) {
      await deleteImage(slide.videoUrl, 'video');
    }

    res.json({ message: 'Slide deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
