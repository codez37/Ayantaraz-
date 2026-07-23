'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth';
import { useGlassmorphicTheme } from '@/providers/GlassmorphicThemeProvider';

// ============================================
// Header Component - Modern Black Gold Professional
// Mobile-First, Accessible, Touch-Friendly
// ============================================

export default function Header() {
  const { theme } = useGlassmorphicTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Theme-based styling - Updated to Modern Black Gold
  const isDark = theme === 'dark';
  const headerBg = isDark ? 'bg-background-primary/95' : 'bg-background-primary/90';
  const headerBorder = isDark ? 'border-border-gold/20' : 'border-border-gold/30';
  const shadowColor = isDark ? 'rgba(201, 162, 39, 0.15)' : 'rgba(201, 162, 39, 0.2)';

  // ==========================================
  // NAVIGATION ITEMS
  // ==========================================
  const navItems = [
    { href: '/services', label: '\u062e\u062f\u0645\u0627\u062a' },
    { href: '/articles', label: '\u0645\u0642\u0627\u0644\u0627\u062a' },
    { href: '/videos', label: '\u0648\u06cc\u062f\u06cc\u0648\u0647\u0627' },
    { href: '/minibooks', label: '\u0645\u06cc\u0646\u06cc\u060c\u0628\u0648\u06a9\u060c\u0647\u0627' },
    { href: '/courses', label: '\u062f\u0648\u0631\u0647\u060c\u0647\u0627' },
    { href: '/tax-consultant', label: '\u062f\u0633\u062a\u06cc\u0627\u0631 \u0647\u0648\u0634\u0645\u0646\u062f' },
    { href: '/about', label: '\u062f\u0631\u0628\u0627\u0631\u0647 \u0645\u0627' },
    { href: '/contact', label: '\u062a\u0645\u0627\u0633' },
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
      className={`${headerBg} backdrop-blur-md sticky top-0 z-[200] border-b ${headerBorder} ${isScrolled ? `shadow-[0_4px_14px_0_${shadowColor}]` : ''} transition-all duration-250 ease-in-out`}
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
                alt="\u0622\u06cc\u0627\u0646 \u062a\u0631\u0627\u0632"
                width={160}
                height={120}
                className="hidden md:block h-10 w-auto"
                priority
              />
              <Image
                src="/logo-mobile.webp"
                alt="\u0622\u06cc\u0627\u0646 \u062a\u0631\u0627\u0632"
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
                  className="px-3 py-2 text-sm text-text-secondary hover:text-gold-primary hover:bg-gold-900/10 transition-colors duration-200 rounded-lg"
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
                    className="text-sm text-text-secondary hover:text-gold-primary transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-gold-900/10"
                  >
                    {user?.firstName || user?.phone}
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="text-sm text-gold-primary hover:text-gold-400 border border-gold-primary/30 px-3 py-1.5 rounded-lg transition-colors duration-200"
                    >
                      \u067e\u0646\u0644 \u0645\u062f\u06cc\u0631\u06cc\u062a
                    </Link>
                  )}
                  <button
                    onClick={() => logout()}
                    className="text-sm text-red-400 hover:text-red-300 px-3 py-2 rounded-lg hover:bg-red-900/20 transition-colors duration-200"
                  >
                    \u062e\u0631\u0648\u062c
                  </button>
                </>
              ) : (
                <Link
                  href="/auth"
                  className="btn-gold text-sm"
                >
                  \u0648\u0631\u0648\u062f / \u062b\u0628\u062a\u060c\u0646\u0627\u0645
                </Link>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              className="md:hidden p-2.5 text-gold-primary hover:bg-gold-900/10 rounded-lg transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="\u0645\u0646\u0648"
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
            className="md:hidden fixed inset-0 bg-background-primary/98 backdrop-blur-md z-[199] animate-in fade-in slide-in-from-top-4 duration-200"
            role="dialog"
            aria-modal="true"
            aria-label="\u0645\u0646\u0648\u06cc \u0627\u0635\u0644\u06cc"
          >
            <div className="flex flex-col h-full">
              {/* Mobile Nav Items */}
              <nav className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-4 py-3 text-base text-text-secondary hover:text-gold-primary hover:bg-gold-900/10 rounded-lg transition-colors duration-200 border border-transparent hover:border-border-gold/20"
                      onClick={() => setMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </nav>

              {/* Mobile Auth Controls */}
              <div className="border-t border-border-gold/20 p-4 space-y-2">
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="block px-4 py-3 text-base text-text-secondary hover:text-gold-primary hover:bg-gold-900/10 rounded-lg transition-colors duration-200"
                      onClick={() => setMenuOpen(false)}
                    >
                      \u067e\u0646\u0644 \u06a9\u0627\u0631\u0628\u0631\u06cc
                      <span className="text-sm text-text-tertiary block">
                        {user?.firstName || user?.phone}
                      </span>
                    </Link>
                    {user?.role === 'admin' && (
                      <Link
                        href="/admin"
                        className="block px-4 py-3 text-base text-gold-primary hover:bg-gold-900/10 rounded-lg transition-colors duration-200"
                        onClick={() => setMenuOpen(false)}
                      >
                        \u067e\u0646\u0644 \u0645\u062f\u06cc\u0631\u06cc\u062a
                      </Link>
                    )}
                    <button
                      onClick={() => { logout(); setMenuOpen(false); }}
                      className="block w-full text-right px-4 py-3 text-base text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                    >
                      \u062e\u0631\u0648\u062c
                    </button>
                  </>
                ) : (
                  <Link
                    href="/auth"
                    className="block px-4 py-3 text-base text-gold-primary text-center bg-gold-900/10 hover:bg-gold-900/20 rounded-lg transition-colors duration-200 font-bold"
                    onClick={() => setMenuOpen(false)}
                  >
                    \u0648\u0631\u0648\u062f / \u062b\u0628\u062a\u060c\u0646\u0627\u0645
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
