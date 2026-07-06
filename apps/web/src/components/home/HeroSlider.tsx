'use client';

import { useState } from 'react';
import Link from 'next/link';

const slides = [
  {
    title: 'خدمات حسابداری حرفه‌ای',
    subtitle: 'مدیریت مالی کسب‌وکار خود را به ما بسپارید',
    cta: 'دریافت مشاوره',
    href: '/consultation',
    gradient: 'from-[#1C1C1C] to-[#111111]',
  },
  {
    title: 'مشاوره مالیاتی تخصصی',
    subtitle: 'بهترین راهکارهای مالیاتی برای کاهش هزینه‌ها',
    cta: 'مشاور هوشمند',
    href: '/tax-consultant',
    gradient: 'from-[#1A1A1A] to-[#111111]',
  },
  {
    title: 'آموزش مالی آنلاین',
    subtitle: 'دوره‌های تخصصی حسابداری و مالیات با مدرک معتبر',
    cta: 'مشاهده دوره‌ها',
    href: '/courses',
    gradient: 'from-[#1C1C1C] to-[#1A1A1A]',
  },
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);

  return (
    <section className={`relative h-[70vh] min-h-[500px] bg-gradient-to-br ${slides[currentSlide].gradient} overflow-hidden`}>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNENEE4NDMiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

      {slides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 flex items-center justify-center px-4 transition-all duration-700 ${
            i === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4 text-white leading-tight">
              {slide.title}
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 mb-8 leading-relaxed">
              {slide.subtitle}
            </p>
            <Link
              href={slide.href}
              className="btn-gold text-lg inline-block"
            >
              {slide.cta}
            </Link>
          </div>
        </div>
      ))}

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`slider-dot ${i === currentSlide ? 'active' : ''}`}
            aria-label={`اسلاید ${i + 1}`}
          />
        ))}
      </div>

      <button onClick={nextSlide} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-[#D4A843] transition-colors z-10 hidden sm:block" aria-label="بعدی">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <button onClick={() => setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-[#D4A843] transition-colors z-10 hidden sm:block" aria-label="قبلی">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </section>
  );
}
