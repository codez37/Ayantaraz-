'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth';

// ============================================
// Header Component - Mobile-First Refactor
// ============================================

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // ==========================================
  // NAVIGATION ITEMS
  // ==========================================
  const navItems = [
    { href: '/services', label: 'خدمات' },
    { href: '/articles', label: 'مقالات' },
    { href: '/videos', label: 'ویدیوها' },
    { href: '/minibooks', label: 'مینی‌بوک‌ها' },
    { href: '/courses', label: 'دوره‌ها' },
    { href: '/tax-consultant', label: 'دستیار هوشمند' },
    { href: '/about', label: 'درباره ما' },
    { href: '/contact', label: 'تماس' },
  ];

  // ==========================================
  // SCROLL EFFECT
  // ==========================================
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ==========================================
  // CLOSE MENU ON ESCAPE
  // ==========================================
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // ==========================================
  // PREVENT BODY SCROLL WHEN MENU OPEN
  // ==========================================
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <header
      className={`
        bg-[#0B0B0C]/95 backdrop-blur-md sticky top-0 z-[200]
        border-b border-[#C9A227]/20
        ${isScrolled ? 'shadow-[0_4px_14px_0_rgba(201,162,39,0.15)]' : ''}
        transition-all duration-250 ease-in-out
      `}
    >
      <div className="container-mobile">
        {/* Main Header Row */}
        <div className="flex justify-between items-center h-16">
          {/* Logo and Desktop Navigation */}
          <div className="flex items-center gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center flex-shrink-0">
              <Image
                src="/logo.webp"
                alt="آیان تراز"
                width={160}
                height={120}
                className="hidden md:block h-10 w-auto"
                priority
              />
              <Image
                src="/logo-mobile.webp"
                alt="آیان تراز"
                width={90}
                height={68}
                className="md:hidden h-8 w-auto"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="
                    px-3 py-2 text-sm text-gray-400
                    hover:text-[#C9A227] hover:bg-[#C9A227]/10
                    transition-colors duration-200
                    rounded-lg
                  "
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Auth Controls */}
          <div className="flex items-center gap-3">
            {/* Desktop Auth Controls */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    className="
                      text-sm text-gray-400 hover:text-[#C9A227]
                      transition-colors duration-200
                      px-3 py-2 rounded-lg hover:bg-[#C9A227]/10
                    "
                  >
                    {user?.firstName || user?.phone}
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="
                        text-sm text-[#C9A227] hover:text-[#A0781E]
                        border border-[#C9A227]/30
                        px-3 py-1.5 rounded-lg
                        transition-colors duration-200
                      "
                    >
                      پنل مدیریت
                    </Link>
                  )}
                  <button
                    onClick={() => logout()}
                    className="
                      text-sm text-red-400 hover:text-red-300
                      px-3 py-2 rounded-lg
                      hover:bg-red-900/20
                      transition-colors duration-200
                    "
                  >
                    خروج
                  </button>
                </>
              ) : (
                <Link
                  href="/auth"
                  className="
                    bg-[#C9A227] text-[#0B0B0C]
                    hover:bg-[#A0781E] active:bg-[#7D5A15]
                    px-5 py-2.5 text-sm font-bold
                    rounded-md
                    shadow-[0_2px_8px_0_rgba(201,162,39,0.25)]
                    hover:shadow-[0_4px_14px_0_rgba(201,162,39,0.39)]
                    transition-all duration-250 ease-in-out
                    min-h-[44px]
                  "
                >
                  ورود / ثبت‌نام
                </Link>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              className="md:hidden p-2.5 text-[#C9A227] hover:bg-[#C9A227]/10 rounded-lg transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="منو"
              aria-expanded={menuOpen}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {menuOpen && (
          <div
            className="
              md:hidden fixed inset-0 bg-[#0B0B0C]/98 backdrop-blur-md z-[199]
              animate-in fade-in slide-in-from-top-4 duration-200
            "
            role="dialog"
            aria-modal="true"
            aria-label="منوی اصلی"
          >
            <div className="flex flex-col h-full">
              {/* Mobile Nav Items */}
              <nav className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="
                        block px-4 py-3 text-base text-gray-300
                        hover:text-[#C9A227] hover:bg-[#C9A227]/10
                        rounded-lg transition-colors duration-200
                        border border-transparent hover:border-[#C9A227]/20
                      "
                      onClick={() => setMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </nav>

              {/* Mobile Auth Controls */}
              <div className="border-t border-[#C9A227]/10 p-4 space-y-2">
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="
                        block px-4 py-3 text-base text-gray-300
                        hover:text-[#C9A227] hover:bg-[#C9A227]/10
                        rounded-lg transition-colors duration-200
                      "
                      onClick={() => setMenuOpen(false)}
                    >
                      پنل کاربری
                      <span className="text-sm text-gray-500 block">
                        {user?.firstName || user?.phone}
                      </span>
                    </Link>
                    {user?.role === 'admin' && (
                      <Link
                        href="/admin"
                        className="
                          block px-4 py-3 text-base text-[#C9A227]
                          hover:bg-[#C9A227]/10
                          rounded-lg transition-colors duration-200
                        "
                        onClick={() => setMenuOpen(false)}
                      >
                        پنل مدیریت
                      </Link>
                    )}
                    <button
                      onClick={() => { logout(); setMenuOpen(false); }}
                      className="
                        block w-full text-right px-4 py-3 text-base text-red-400
                        hover:text-red-300 hover:bg-red-900/20
                        rounded-lg transition-colors duration-200
                      "
                    >
                      خروج
                    </button>
                  </>
                ) : (
                  <Link
                    href="/auth"
                    className="
                      block px-4 py-3 text-base text-[#C9A227] text-center
                      bg-[#C9A227]/10 hover:bg-[#C9A227]/20
                      rounded-lg transition-colors duration-200
                      font-bold
                    "
                    onClick={() => setMenuOpen(false)}
                  >
                    ورود / ثبت‌نام
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
