'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

// ============================================
// HeroSlider Component - Mobile-First Refactor
// 10-second auto-play as per requirements
// ============================================

const slides = [
  {
    title: '\u062e\u062f\u0645\u0627\u062a \u062d\u0633\u0627\u0628\u062f\u0627\u0631\u06cc \u062d\u0631\u0641\u0647\u060c\u0627\u06cc',
    subtitle: '\u0645\u062f\u06cc\u0631\u06cc\u062a \u0645\u0627\u0644\u06cc \u06a9\u0633\u0628\u060c\u0648\u06a9\u0627\u0631 \u062e\u0648\u062f \u0631\u0627 \u0628\u0647 \u0645\u0627 \u0628\u0633\u067e\u0627\u0631\u06cc\u062f',
    cta: '\u062f\u0631\u06cc\u0627\u0641\u062a \u0645\u0634\u0627\u0648\u0631\u0647',
    href: '/consultation',
    gradient: 'from-[#08090B] to-[#111318]',
  },
  {
    title: '\u0645\u0634\u0627\u0648\u0631\u0647 \u0645\u0627\u0644\u06cc\u0627\u062a\u06cc \u062a\u062e\u0635\u0635\u06cc',
    subtitle: '\u0628\u0647\u062a\u0631\u06cc\u0646 \u0631\u0627\u0647\u06a9\u0627\u0631\u0647\u0627\u06cc \u0645\u0627\u0644\u06cc\u0627\u062a\u06cc \u0628\u0631\u0627\u06cc \u06a9\u0627\u0647\u0634 \u0647\u0632\u06cc\u0646\u0647\u060c\u0647\u0627',
    cta: '\u062f\u0633\u062a\u06cc\u0627\u0631 \u0647\u0648\u0634\u0645\u0646\u062f',
    href: '/tax-consultant',
    gradient: 'from-[#111318] to-[#08090B]',
  },
  {
    title: '\u0622\u0645\u0648\u0632\u0634 \u0645\u0627\u0644\u06cc \u0622\u0646\u0644\u0627\u06cc\u0646',
    subtitle: '\u062f\u0648\u0631\u0647\u060c\u0647\u0627\u06cc \u0648 \u0645\u0642\u0627\u0644\u0627\u062a \u0622\u0645\u0648\u0632\u0634\u06cc \u062f\u0631 \u0632\u0645\u06cc\u0646\u0647 \u0642\u0648\u0627\u0646\u06cc\u0646 \u0645\u0627\u0644\u06cc\u0627\u062a\u06cc \u062f\u0631 \u0645\u062f\u0631\u0646 \u0639\u062a\u0628\u0647',
    cta: '\u0645\u0634\u0627\u0647\u062f\u0647 \u062f\u0648\u0631\u0633\u060c\u0647\u0627',
    href: '/courses',
    gradient: 'from-[#08090B] to-[#111318]',
  },
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // ==========================================
  // AUTO-PLAY - 10 SECONDS AS REQUIRED
  // ==========================================
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  // Auto-play every 10 seconds - EXACT REQUIREMENT
  useEffect(() => {
    const timer = setInterval(nextSlide, 10000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  // ==========================================
  // TOUCH GESTURES (Mobile)
  // ==========================================
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart === null || touchEnd === null) return;
    
    const diff = touchStart - touchEnd;
    
    if (diff > 5) {
      // Swipe left - next slide
      nextSlide();
    } else if (diff < -5) {
      // Swipe right - previous slide
      prevSlide();
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  // ==========================================
  // KEYBOARD NAVIGATION
  // ==========================================
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      nextSlide();
    } else if (e.key === 'ArrowRight') {
      prevSlide();
    }
  }, [nextSlide, prevSlide]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <section
      className={`
        relative 
        h-[60vh] min-h-[400px] md:h-[70vh] md:min-h-[500px]
        bg-gradient-to-br ${slides[currentSlide].gradient}
        overflow-hidden
      `}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-label="\u0627\u0633\u0644\u0627\u06cc\u062f\u0631 \u0627\u0635\u0644\u06cc"
    >
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNCOTVBOUIiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')",
        }}
      />

      {/* Slide Content */}
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`
            absolute inset-0 
            flex items-center justify-center 
            px-4 md:px-8
            transition-all duration-700 ease-in-out
            ${
              i === currentSlide 
                ? 'opacity-100 translate-y-0 scale-100' 
                : 'opacity-0 translate-y-4 scale-95'
            }
          `}
          aria-hidden={i !== currentSlide}
        >
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 text-white leading-tight">
              {slide.title}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-text-secondary mb-8 leading-relaxed max-w-xl mx-auto">
              {slide.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={slide.href}
                className="
                  bg-gold-primary text-background-primary
                  hover:bg-gold-soft active:bg-gold-500
                  px-8 py-3 text-base md:text-lg font-bold
                  rounded-md
                  shadow-gold-md
                  hover:shadow-gold-lg
                  transition-all duration-250 ease-in-out
                  hover:-translate-y-px active:translate-y-0
                  min-h-[48px]
                "
              >
                {slide.cta}
              </Link>
              <Link
                href="/about"
                className="
                  bg-transparent text-gold-primary border border-border-gold
                  hover:bg-surface hover:border-border-gold-hover
                  px-8 py-3 text-base md:text-lg font-bold
                  rounded-md
                  transition-all duration-250 ease-in-out
                  min-h-[48px]
                "
              >
                \u0628\u06cc\u0634\u062a\u0631 \u0628\u062f\u0627\u0646\u06cc\u062f
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Pagination Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`slider-dot ${i === currentSlide ? 'active' : ''}`}
            aria-label={`\u0627\u0633\u0644\u0627\u06cc\u062f ${i + 1}`}
            aria-current={i === currentSlide}
          />
        ))}
      </div>

      {/* Navigation Arrows - Desktop */}
      <button 
        onClick={nextSlide} 
        className="
          absolute left-4 top-1/2 -translate-y-1/2 
          text-white/50 hover:text-gold-primary
          transition-colors duration-200
          z-10 p-2 rounded-full hover:bg-gold-primary/10
          hidden sm:block
        "
        aria-label="\u0627\u0633\u0644\u0627\u06cc\u062f \u0628\u0639\u062f\u06cc"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      
      <button 
        onClick={prevSlide} 
        className="
          absolute right-4 top-1/2 -translate-y-1/2 
          text-white/50 hover:text-gold-primary
          transition-colors duration-200
          z-10 p-2 rounded-full hover:bg-gold-primary/10
          hidden sm:block
        "
        aria-label="\u0627\u0633\u0644\u0627\u06cc\u062f \u0642\u0628\u0644\u06cc"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Mobile Swipe Indicator */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 sm:hidden">
        <p className="text-xs text-text-secondary animate-pulse">
          \u0628\u0631\u0627\u06cc \u062a\u063a\u06cc\u06cc\u0631 \u0627\u0633\u0644\u0627\u06cc\u062f \u0628\u0647 \u0686\u067e \u06cc\u0627 \u0631\u0627\u0633\u062a \u0628\u06a9\u0634\u06cc\u062f
        </p>
      </div>
    </section>
  );
}
