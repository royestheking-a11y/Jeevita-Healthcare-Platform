import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import { Button } from './ui/button';
import { Volume2, VolumeX } from 'lucide-react';

interface HeroCarouselProps {
  onNavigate: (page: string) => void;
}

export function HeroCarousel({ onNavigate }: HeroCarouselProps) {
  const { t } = useLanguage();
  const { carouselSlides, loading } = useData();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  const getYoutubeEmbedUrl = (url: string) => {
    try {
      if (!url) return '';
      // Handle standard watch URLs
      if (url.includes('watch?v=')) {
        const id = url.split('watch?v=')[1].split('&')[0];
        return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${id}&playsinline=1&rel=0`;
      }
      // Handle short URLs
      if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1].split('?')[0];
        return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${id}&playsinline=1&rel=0`;
      }
      // Handle embed URLs
      if (url.includes('embed/')) {
        const id = url.split('embed/')[1].split('?')[0];
        return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${id}&playsinline=1&rel=0`;
      }
      return url;
    } catch (e) {
      return url;
    }
  };

  const slides = carouselSlides.map(slide => ({
    image: slide.image,
    title: slide.title,
    subtitle: slide.subtitle,
    cta: slide.buttonText || slide.cta,
    videoType: slide.videoType,
    videoUrl: slide.videoUrl,
    action: () => {
      // Use buttonType if available, otherwise fall back to old logic
      const buttonType = slide.buttonType;
      if (buttonType) {
        switch (buttonType) {
          case 'order':
            onNavigate('medicines');
            break;
          case 'appointment':
            onNavigate('doctors');
            break;
          case 'hospital':
            onNavigate('hospitals');
            break;
          case 'custom':
            if (slide.buttonLink) {
              // Handle custom links
              if (slide.buttonLink.startsWith('http')) {
                window.open(slide.buttonLink, '_blank');
              } else {
                // Internal route - extract page name
                const page = slide.buttonLink.replace('/', '');
                if (page) onNavigate(page);
              }
            }
            break;
        }
      } else {
        // Fallback to old logic for backward compatibility
        const ctaText = slide.cta.toLowerCase();
        if (ctaText.includes('medicine')) {
          onNavigate('medicines');
        } else if (ctaText.includes('hospital')) {
          onNavigate('hospitals');
        } else {
          onNavigate('doctors');
        }
      }
    }
  }));

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 15000);

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
    <div className="relative h-[500px] md:h-[600px] overflow-hidden bg-gray-900">
      {slides.map((slide: { image: string; title: string; subtitle: string; cta: string; videoType?: string; videoUrl?: string; action: () => void }, index: number) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
        >
          {/* Background Media */}
          <div className="absolute inset-0 bg-black/20">
            {slide.videoType === 'youtube' && slide.videoUrl ? (
              <div className="absolute inset-0 pointer-events-none">
                <iframe
                  src={getYoutubeEmbedUrl(slide.videoUrl)}
                  className="w-full h-full object-cover scale-150"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ pointerEvents: 'none' }}
                />
              </div>
            ) : slide.videoType === 'upload' && slide.videoUrl ? (
              <video
                ref={(el) => {
                  if (el && index === currentSlide) {
                    el.currentTime = 0;
                    el.play().catch(e => console.log('Autoplay prevented:', e));
                  } else if (el) {
                    el.pause();
                  }
                }}
                src={slide.videoUrl}
                autoPlay
                loop
                muted={isMuted}
                playsInline
                preload="auto"
                className="absolute inset-0 w-full h-full object-cover"
                poster={slide.image}
              />
            ) : (
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${slide.image})` }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40" />
          </div>

          {/* Sound Toggle for Video Slides */}
          {index === currentSlide && slide.videoType === 'upload' && slide.videoUrl && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMuted(!isMuted);
              }}
              className="absolute bottom-8 right-8 z-20 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all hover:scale-110"
              title={isMuted ? "Unmute Video" : "Mute Video"}
            >
              {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            </button>
          )}

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
