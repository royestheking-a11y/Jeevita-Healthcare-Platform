import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import { Button } from './ui/button';

interface HeroCarouselProps {
  onNavigate: (page: string) => void;
}

export function HeroCarousel({ onNavigate }: HeroCarouselProps) {
  const { t } = useLanguage();
  const { carouselSlides, loading } = useData();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = carouselSlides.map(slide => ({
    image: slide.image,
    title: slide.title,
    subtitle: slide.subtitle,
    cta: slide.cta,
    action: () => {
      const ctaText = slide.cta.toLowerCase();
      if (ctaText.includes('medicine') || ctaText.includes('order')) {
        onNavigate('medicines');
      } else if (ctaText.includes('hospital') || ctaText.includes('visit')) {
        onNavigate('hospitals');
      } else {
        onNavigate('doctors');
      }
    }
  }));

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  if (loading) {
    return (
      <div className="relative h-[500px] md:h-[600px] overflow-hidden bg-gray-200 animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (slides.length === 0) {
    return null;
  }

  return (
    <div className="relative h-[500px] md:h-[600px] overflow-hidden">
      {slides.map((slide: { image: string; title: string; subtitle: string; cta: string; action: () => void }, index: number) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
        >
          {/* Background Image with Overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40" />
          </div>

          {/* Content */}
          <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
            <div className="max-w-2xl text-white">
              <h1 className="mb-4">{slide.title}</h1>
              <p className="text-xl mb-8 text-gray-200">{slide.subtitle}</p>
              <Button
                onClick={slide.action}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-6 shadow-2xl shadow-amber-500/50"
                size="lg"
              >
                {slide.cta}
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
