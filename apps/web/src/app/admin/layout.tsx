'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';

const sidebarItems = [
  {
    href: '/admin',
    label: 'داشبورد',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  },
  {
    href: '/admin/contents',
    label: 'مدیریت محتوا',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  },
  {
    href: '/admin/courses',
    label: 'مدیریت دوره‌ها',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  },
  {
    href: '/admin/users',
    label: 'مدیریت کاربران',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  },
  {
    href: '/admin/consultations',
    label: 'مشاوره‌ها',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
  },
  {
    href: '/admin/orders',
    label: 'سفارش‌ها',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  },
  {
    href: '/admin/chatbot',
    label: 'پرسش و پاسخ',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>,
    badge: true,
  },
  {
    href: '/admin/audit-logs',
    label: 'گزارش فعالیت',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
  },
  {
    href: '/admin/settings',
    label: 'تنظیمات',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  },
];

const quickActions = [
  { label: 'کاربر جدید', href: '/admin/users/create', icon: '👤' },
  { label: 'محتوا جدید', href: '/admin/contents/create', icon: '📝' },
  { label: 'دوره جدید', href: '/admin/courses/create', icon: '📚' },
  { label: 'تیکت‌ها', href: '/admin/support', icon: '🎫' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setSidebarOpen(window.innerWidth >= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, user, router]);

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [pathname, isMobile]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center safe-area-top">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-[#D4A843] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#D4A843] text-sm font-medium">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[#0A0A0A] safe-area-top">
      {sidebarOpen && isMobile && (
        <div className="fixed inset-0 z-[55] bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden" onClick={closeSidebar} aria-hidden="true" />
      )}

      <aside className={`fixed top-0 right-0 z-[60] h-full bg-[#0A0A0A] border-l border-[#D4A843]/10 flex flex-col ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out md:translate-x-0 md:relative md:z-auto w-64 md:w-64`}>
        <div className="p-4 border-b border-[#D4A843]/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#F0D68A] to-[#B8862D] rounded-xl flex items-center justify-center text-[#0A0A0A] font-black text-lg">آ</div>
            <div>
              <h2 className="font-bold text-[#F0D68A] text-lg">آیان تراز</h2>
              <p className="text-[#D4A843]/70 text-xs">پنل مدیریت</p>
            </div>
          </div>
        </div>

        <div className="hidden md:block p-3 border-b border-[#D4A843]/10">
          <p className="text-[#D4A843]/60 text-xs font-medium mb-2">دسترسی سریع</p>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href} className="flex items-center gap-2 p-2 bg-[#111111]/50 rounded-lg text-xs text-gray-400 hover:bg-[#111111]/80 hover:text-[#F0D68A] transition-all">
                <span>{action.icon}</span>
                <span>{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto custom-scrollbar">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} onClick={isMobile ? closeSidebar : undefined} className={`flex items-center gap-3 p-2.5 rounded-xl text-sm transition-all ${isActive ? 'bg-[#D4A843]/15 text-[#F0D68A] border-r-3 border-[#F0D68A]' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}>
                <span className={`transition-colors ${isActive ? 'text-[#F0D68A]' : 'text-gray-500'}`}>{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.badge && <span className="w-2 h-2 bg-[#F0D68A] rounded-full" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[#D4A843]/10 flex-shrink-0">
          <div className="flex items-center gap-3 p-2 bg-[#111111]/50 rounded-xl">
            <div className="w-10 h-10 bg-gradient-to-br from-[#D4A843] to-[#B8862D] rounded-full flex items-center justify-center text-[#0A0A0A] font-bold">
              {user?.name?.charAt(0) || 'کاربر'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[#F0D68A] text-sm truncate">{user?.name || 'ادمین'}</p>
              <p className="text-[#D4A843]/60 text-xs">{user?.email || user?.phone}</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="sticky top-0 z-[50] bg-[#0A0A0A]/80 backdrop-blur-lg border-b border-[#D4A843]/10 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={toggleSidebar} className="md:hidden p-2 rounded-lg text-gray-400 hover:text-[#F0D68A] hover:bg-white/5 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <nav className="hidden md:flex items-center gap-2 text-sm">
              <Link href="/admin" className="text-[#F0D68A] hover:text-[#D4A843] transition-colors">داشبورد</Link>
              <span className="text-gray-500">/</span>
              <span className="text-gray-400 truncate max-w-xs">{pathname.split('/').pop() || 'صفحه اصلی'}</span>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg text-gray-400 hover:text-[#F0D68A] hover:bg-white/5 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#F0D68A] rounded-full" />
            </button>
            <button className="p-2 rounded-lg text-gray-400 hover:text-[#F0D68A] hover:bg-white/5 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
            <button className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6 bg-[#0A0A0A]">{children}</main>

        <footer className="border-t border-[#D4A843]/10 px-4 py-3 flex-shrink-0">
          <p className="text-center text-[11px] text-gray-600">© {new Date().getFullYear()} آیان تراز - تمام حقوق محفوظ است</p>
        </footer>
      </div>

      {isMobile && !sidebarOpen && (
        <div className="fixed bottom-0 left-0 right-0 z-[50] bg-[#0A0A0A] border-t border-[#D4A843]/10 px-4 py-2 safe-area-bottom">
          <div className="flex justify-around">
            {quickActions.slice(0, 4).map((action) => (
              <Link key={action.href} href={action.href} className="flex flex-col items-center gap-1 p-2 text-xs text-gray-400 hover:text-[#F0D68A] transition-colors">
                <span className="text-lg">{action.icon}</span>
                <span>{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}