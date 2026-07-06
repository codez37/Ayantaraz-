'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface DashboardStats {
  totalUsers: number;
  totalContents: number;
  totalCourses: number;
  totalOrders: number;
  totalConsultations: number;
  pendingOrders: number;
  pendingConsultations: number;
  draftContents: number;
}

const statCards = [
  { label: 'کاربران', key: 'totalUsers' as const, icon: '👥' },
  { label: 'محتوا', key: 'totalContents' as const, icon: '📝' },
  { label: 'دوره‌ها', key: 'totalCourses' as const, icon: '📚' },
  { label: 'سفارش‌ها', key: 'totalOrders' as const, icon: '🛒' },
  { label: 'مشاوره‌ها', key: 'totalConsultations' as const, icon: '📞' },
];

const pendingCards = [
  { label: 'سفارش در انتظار', key: 'pendingOrders' as const, icon: '⏳' },
  { label: 'مشاوره در انتظار', key: 'pendingConsultations' as const, icon: '📋' },
  { label: 'پیش‌نویس محتوا', key: 'draftContents' as const, icon: '✏️' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ stats: DashboardStats }>('/admin/dashboard')
      .then(d => setStats(d.stats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-[#D4A843] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-black text-white">داشبورد مدیریت</h1>
        <span className="text-xs text-gray-500">{new Date().toLocaleDateString('fa-IR')}</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {statCards.map(s => (
          <div key={s.key} className="bg-[#0A0A0A] border border-[#D4A843]/10 rounded-xl p-4 text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-black text-gold-gradient">{stats?.[s.key] ?? 0}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {pendingCards.map(s => (
          <div key={s.key} className="bg-[#0A0A0A] border border-[#D4A843]/10 rounded-xl p-4 flex items-center gap-3">
            <div className="text-2xl">{s.icon}</div>
            <div>
              <div className="text-xl font-black text-[#D4A843]">{stats?.[s.key] ?? 0}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#0A0A0A] border border-[#D4A843]/10 rounded-xl p-5">
        <h2 className="text-sm font-bold text-white mb-3">دسترسی سریع</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { href: '/admin/contents', label: '➕ محتوای جدید', color: 'text-[#D4A843]' },
            { href: '/admin/courses', label: '📚 دوره جدید', color: 'text-[#D4A843]' },
            { href: '/admin/consultations', label: '📞 مشاوره‌ها', color: 'text-gray-400' },
            { href: '/admin/orders', label: '🛒 سفارش‌ها', color: 'text-gray-400' },
          ].map(item => (
            <Link key={item.href} href={item.href}
              className="bg-[#111111] p-3 rounded-lg text-sm hover:bg-[#D4A843]/10 transition-colors text-right"
            >
              <span className={item.color}>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
