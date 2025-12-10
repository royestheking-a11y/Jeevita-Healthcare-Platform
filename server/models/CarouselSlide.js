import mongoose from 'mongoose';

const carouselSlideSchema = new mongoose.Schema({
  image: { type: String, default: '' },
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  cta: { type: String, required: true },
  buttonText: { type: String, default: 'Get Started' },
  buttonType: {
    type: String,
    enum: ['order', 'appointment', 'hospital', 'custom'],
    default: 'custom'
  },
  buttonLink: { type: String, default: '' },
  videoType: {
    type: String,
    enum: ['none', 'youtube', 'upload'],
    default: 'none'
  },
  videoUrl: { type: String, default: '' }
}, {
  timestamps: true
});

export const CarouselSlide = mongoose.model('CarouselSlide', carouselSlideSchema);

