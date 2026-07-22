'use client';

import { useState } from 'react';
import { useDashboardStats } from '@/lib/hooks/useApi';
import { DashboardStatsSkeleton, PageLoadingSkeleton } from '@/components/ui/Skeleton';

interface DashboardStats {
  totalUsers?: number;
  totalContents?: number;
  totalCourses?: number;
  totalOrders?: number;
  totalConsultations?: number;
  pendingOrders?: number;
  pendingConsultations?: number;
  draftContents?: number;
}

interface AuditLog {
  id: number;
  action: string;
  entityType: string;
  actor?: { phone?: string; firstName?: string; lastName?: string };
  createdAt: string;
}

// Format Persian numbers
function formatPersianNumber(num: number | undefined): string {
  if (num === undefined) return '۰';
  return num.toLocaleString('fa-IR');
}

// Format date for Persian locale
function formatPersianDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR');
  } catch {
    return dateString;
  }
}

export default function AdminDashboardPage() {
  const { data, isLoading, error, isFetching } = useDashboardStats();
  const [showAudits, setShowAudits] = useState(true);

  if (isLoading && !isFetching) {
    return <DashboardStatsSkeleton />;
  }

  if (error) {
    return (
      <div className="bg-[#C9A227]/10 border border-[#C9A227]/30 text-[#C9A227] p-4 rounded-lg">
        خطا در دریافت اطلاعات: {error.message}
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentAudits = data?.recentAudits || [];

  const statCards = [
    { title: 'کاربران', value: stats.totalUsers ?? 0, color: '#C9A227' },
    { title: 'محتواها', value: stats.totalContents ?? 0, color: '#A0781E' },
    { title: 'دوره‌ها', value: stats.totalCourses ?? 0, color: '#4CAF50' },
    { title: 'مشاوره‌ها', value: stats.totalConsultations ?? 0, color: '#2196F3' },
    { title: 'سفارش‌ها', value: stats.totalOrders ?? 0, color: '#9C27B0' },
    { title: 'در انتظار پرداخت', value: stats.pendingOrders ?? 0, color: '#FF9800' },
    { title: 'در انتظار تماس', value: stats.pendingConsultations ?? 0, color: '#F44336' },
    { title: 'پیش‌نویس‌ها', value: stats.draftContents ?? 0, color: '#795548' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gold-gradient">داشبورد مدیریتی</h1>
        <p className="text-sm text-gray-500">نمای کلی سیستم</p>
      </div>
      
      {isFetching && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-[#121212] border border-[#C9A227]/20 rounded-lg px-4 py-2">
            <span className="text-sm text-[#C9A227]">در حال به‌روزرسانی...</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-[#121212] p-4 rounded-xl border border-[#1A1A1A] hover:border-[#C9A227]/20 transition-colors group">
            <div className="text-xs text-gray-500 mb-1">{stat.title}</div>
            <div className="text-xl font-bold" style={{ color: stat.color }}>
              {formatPersianNumber(stat.value)}
            </div>
          </div>
        ))}
      </div>

      {showAudits && recentAudits.length > 0 && (
        <div className="bg-[#121212] rounded-xl border border-[#1A1A1A] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">آخرین فعالیت‌ها</h2>
            <button
              onClick={() => setShowAudits(false)}
              className="text-xs text-gray-400 hover:text-[#C9A227] transition-colors"
            >
              مخفی کردن
            </button>
          </div>
          <div className="space-y-3">
            {recentAudits.slice(0, 5).map((audit) => (
              <div key={audit.id} className="flex items-center gap-3 p-3 bg-[#0B0B0C]/50 rounded-lg border border-[#C9A227]/10 hover:bg-[#0B0B0C]/80 transition-colors">
                <div className="w-8 h-8 rounded-full bg-[#C9A227]/10 flex items-center justify-center text-[#C9A227] text-sm font-bold">
                  {audit.action.slice(0, 1).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">
                    {audit.action}
                  </div>
                  <div className="text-xs text-gray-500">
                    {audit.entityType} • {formatPersianDate(audit.createdAt)}
                  </div>
                </div>
                {audit.actor && (
                  <div className="text-xs text-gray-400 whitespace-nowrap">
                    {audit.actor.firstName || audit.actor.phone?.slice(-4)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {showAudits && recentAudits.length === 0 && (
        <div className="bg-[#121212] rounded-xl border border-[#1A1A1A] p-6 text-center text-gray-500">
          هیچ فعالیت اخیری یافت نشد
        </div>
      )}
    </div>
  );
}
