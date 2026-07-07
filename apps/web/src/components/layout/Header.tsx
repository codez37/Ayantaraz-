'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

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

  return (
    <header className="bg-[#111111]/95 backdrop-blur-md sticky top-0 z-50 border-b border-[#D4A843]/20">
      <div className="container-mobile">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.webp"
                alt="آیان تراز"
                width={160}
                height={120}
                className="hidden md:block h-14 w-auto"
                priority
              />
              <Image
                src="/logo-mobile.webp"
                alt="آیان تراز"
                width={90}
                height={68}
                className="md:hidden h-12 w-auto"
                priority
              />
            </Link>
            <nav className="hidden md:flex gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-2 text-sm text-gray-400 hover:text-[#D4A843] transition-colors rounded-lg hover:bg-[#D4A843]/10"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Desktop auth controls */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-sm text-gray-400 hover:text-[#D4A843] transition-colors px-3 py-2 rounded-lg hover:bg-[#D4A843]/10"
                  >
                    {user?.firstName || user?.phone}
                  </Link>
                  {user?.role === 'admin' && (
                    <Link href="/admin" className="text-sm text-[#D4A843] hover:text-[#F0D68A] border border-[#D4A843]/30 px-3 py-1.5 rounded-lg">
                      پنل مدیریت
                    </Link>
                  )}
                  <button onClick={() => logout()} className="text-sm text-red-400 hover:text-red-300 px-3 py-2 rounded-lg hover:bg-red-900/20 transition-colors">
                    خروج
                  </button>
                </>
              ) : (
                <Link
                  href="/auth"
                  className="btn-gold text-sm !py-2 !px-5"
                >
                  ورود / ثبت‌نام
                </Link>
              )}
            </div>
            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 text-[#D4A843]"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="منو"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="md:hidden pb-4 border-t border-[#D4A843]/10 pt-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-4 py-2.5 text-gray-400 hover:text-[#D4A843] hover:bg-[#D4A843]/10 rounded-lg transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {/* Mobile auth controls */}
            <div className="border-t border-[#D4A843]/10 pt-3 mt-3 space-y-1">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2.5 text-gray-400 hover:text-[#D4A843] hover:bg-[#D4A843]/10 rounded-lg transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    پنل کاربری ({user?.firstName || user?.phone})
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="block px-4 py-2.5 text-[#D4A843] hover:bg-[#D4A843]/10 rounded-lg transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      پنل مدیریت
                    </Link>
                  )}
                  <button
                    onClick={() => { logout(); setMenuOpen(false); }}
                    className="block w-full text-right px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    خروج
                  </button>
                </>
              ) : (
                <Link
                  href="/auth"
                  className="block px-4 py-2.5 text-[#D4A843] hover:bg-[#D4A843]/10 rounded-lg transition-colors font-bold"
                  onClick={() => setMenuOpen(false)}
                >
                  ورود / ثبت‌نام
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
