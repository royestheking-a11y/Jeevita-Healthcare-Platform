import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import { Button } from './ui/button';

interface HeroCarouselProps {
  onNavigate: (page: string) => void;
}

export function HeroCarousel({ onNavigate }: HeroCarouselProps) {
  const { t } = useLanguage();
  const { carouselSlides } = useData();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fallback slides if no data is available
  const defaultSlides = [
    {
      image: 'https://images.unsplash.com/photo-1666886573230-2b730505f298?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2N0b3IlMjBtZWRpY2FsJTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc2MjI4MjE0Mnww&ixlib=rb-4.1.0&q=80&w=1080',
      title: t('hero.title1'),
      subtitle: t('hero.subtitle1'),
      cta: 'Book Appointment Now',
      action: () => onNavigate('doctors'),
    },
  ];

  const slides = carouselSlides.length > 0 ? carouselSlides.map(slide => ({
    image: slide.image,
    title: slide.title,
    subtitle: slide.subtitle,
    cta: slide.cta,
    action: () => {
      const ctaText = slide.cta.toLowerCase();
      if (ctaText.includes('medicine')) {
        onNavigate('medicines');
      } else if (ctaText.includes('hospital')) {
        onNavigate('hospitals');
      } else {
        onNavigate('doctors');
      }
    }
  })) : defaultSlides;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

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
