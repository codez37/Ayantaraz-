'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

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

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({});
  const [recentAudits, setRecentAudits] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch dashboard stats from API
        const dashboardData = await api.get<{ stats: DashboardStats; recentAudits: AuditLog[] }>('/admin/dashboard');
        setStats(dashboardData.stats || {});
        setRecentAudits(dashboardData.recentAudits || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'خطا در دریافت اطلاعات');
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#C9A227] border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#C9A227]/10 border border-[#C9A227]/30 text-[#C9A227] p-4 rounded-lg">
        {error}
      </div>
    );
  }

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
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-[#121212] p-4 rounded-xl border border-[#1A1A1A] hover:border-[#C9A227]/20 transition-colors">
            <div className="text-xs text-gray-500 mb-1">{stat.title}</div>
            <div className="text-xl font-bold" style={{ color: stat.color }}>
              {stat.value.toLocaleString('fa-IR')}
            </div>
          </div>
        ))}
      </div>

      {recentAudits.length > 0 && (
        <div className="bg-[#121212] rounded-xl border border-[#1A1A1A] p-6">
          <h2 className="text-lg font-bold text-white mb-4">آخرین فعالیت‌ها</h2>
          <div className="space-y-3">
            {recentAudits.slice(0, 5).map((audit) => (
              <div key={audit.id} className="flex items-center gap-3 p-3 bg-[#0B0B0C]/50 rounded-lg border border-[#C9A227]/10">
                <div className="w-8 h-8 rounded-full bg-[#C9A227]/10 flex items-center justify-center text-[#C9A227] text-sm">
                  {audit.action.slice(0, 1)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">
                    {audit.action}
                  </div>
                  <div className="text-xs text-gray-500">
                    {audit.entityType} • {new Date(audit.createdAt).toLocaleDateString('fa-IR')}
                  </div>
                </div>
                {audit.actor && (
                  <div className="text-xs text-gray-400">
                    {audit.actor.firstName || audit.actor.phone?.slice(-4)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
