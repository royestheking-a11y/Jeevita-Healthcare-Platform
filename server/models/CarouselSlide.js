import mongoose from 'mongoose';

const carouselSlideSchema = new mongoose.Schema({
  image: { type: String, required: true },
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  cta: { type: String, required: true }
}, {
  timestamps: true
});

export const CarouselSlide = mongoose.model('CarouselSlide', carouselSlideSchema);

