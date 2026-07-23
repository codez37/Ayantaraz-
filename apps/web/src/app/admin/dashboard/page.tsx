'use client';

import { useState } from 'react';
import { useDashboardStats } from '@/lib/hooks/useApi';
import { DashboardStatsSkeleton, PageLoadingSkeleton } from '@/components/ui/Skeleton';
import { useGlassmorphicTheme } from '@/providers/GlassmorphicThemeProvider';

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
  if (num === undefined) return '\u06f0';
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

// Color palette for stat cards - Modern Black Gold
const statColors = [
  '#C9A227', // Gold Primary
  '#A88632', // Gold Soft
  '#4CAF50', // Green
  '#2196F3', // Blue
  '#9C27B0', // Purple
  '#FF9800', // Orange
  '#F44336', // Red
  '#795548', // Brown
];

export default function AdminDashboardPage() {
  const { theme } = useGlassmorphicTheme();
  const { data, isLoading, error, isFetching } = useDashboardStats();
  const [showAudits, setShowAudits] = useState(true);

  if (isLoading && !isFetching) {
    return <DashboardStatsSkeleton />;
  }

  if (error) {
    return (
      <div className="glass-card border border-gold-primary/30 text-gold-primary p-4 rounded-xl">
        \u062e\u0637\u0627 \u062f\u0631 \u062f\u0631\u06cc\u0627\u0641\u062a \u0627\u0635\u0644\u06cc\u0639\u0627\u062a: {error.message}
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentAudits = data?.recentAudits || [];

  const statCards = [
    { title: '\u06a9\u0627\u0631\u0628\u0631\u0627\u0646', value: stats.totalUsers ?? 0, color: statColors[0] },
    { title: '\u0645\u062d\u062a\u0648\u0627\u06cc\u0627', value: stats.totalContents ?? 0, color: statColors[1] },
    { title: '\u062f\u0648\u0631\u0647\u060c\u0647\u0627', value: stats.totalCourses ?? 0, color: statColors[2] },
    { title: '\u0645\u0634\u0627\u0648\u0631\u0627\u062a\u060c\u0647\u0627', value: stats.totalConsultations ?? 0, color: statColors[3] },
    { title: '\u0633\u0641\u0627\u0631\u0634\u060c\u0647\u0627', value: stats.totalOrders ?? 0, color: statColors[4] },
    { title: '\u062f\u0631 \u0627\u0646\u062a\u0638\u0627\u0631 \u067e\u0631\u062f\u0627\u062e\u062a', value: stats.pendingOrders ?? 0, color: statColors[5] },
    { title: '\u062f\u0631 \u0627\u0646\u062a\u0638\u0627\u0631 \u062a\u0645\u0627\u0633', value: stats.pendingConsultations ?? 0, color: statColors[6] },
    { title: '\u067e\u06cc\u0634\u060c\u0646\u0648\u06cc\u0633\u060c\u0647\u0627', value: stats.draftContents ?? 0, color: statColors[7] },
  ];

  // Theme-based styling
  const isDark = theme === 'dark';
  const cardBg = isDark ? 'bg-background-secondary/60' : 'bg-background-primary/80';
  const cardBorder = isDark ? 'border-border-gold/20' : 'border-border-gold/30';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gold-gradient">\u062f\u0627\u0633\u0628\u0648\u0631\u062f \u0645\u062f\u06cc\u0631\u06cc\u062a\u06cc</h1>
          <p className="text-sm text-text-secondary mt-1">\u0646\u0645\u0627\u06cc \u06a9\u0644\u06cc \u0633\u06cc\u0633\u062a\u0645</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-gold-primary animate-pulse" />
          <span className="text-sm text-text-secondary">\u0628\u0647\u200c\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06cc \u062e\u0648\u062f\u06a9\u0627\u0631</span>
        </div>
      </div>
      
      {isFetching && (
        <div className="fixed top-4 right-4 z-50">
          <div className="glass-card p-4 rounded-xl shadow-gold-md">
            <span className="text-sm text-gold-primary">\u062f\u0631 \u062d\u0627\u0644 \u0628\u0647\u200c\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06cc...</span>
          </div>
        </div>
      )}

      {/* Stats Grid - Mobile First */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {statCards.map((stat, index) => (
          <div 
            key={index} 
            className={`glass-card ${cardBg} ${cardBorder} p-4 rounded-xl group transition-all duration-300 hover:-translate-y-1 hover:border-border-gold/40`}
          >
            <div className="text-xs text-text-secondary mb-1">{stat.title}</div>
            <div 
              className="text-xl font-bold gold-sheen" 
              style={{ backgroundImage: `linear-gradient(135deg, ${stat.color} 0%, ${stat.color}CC 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
            >
              {formatPersianNumber(stat.value)}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      {showAudits && recentAudits.length > 0 && (
        <div className={`glass-card ${cardBg} ${cardBorder} rounded-2xl p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">\u0622\u062e\u0631\u06cc\u0646 \u0641\u0639\u0627\u0644\u06cc\u062a\u060c\u0647\u0627</h2>
            <button
              onClick={() => setShowAudits(false)}
              className="text-xs text-text-secondary hover:text-gold-primary transition-colors"
            >
              \u0645\u062e\u0641\u06cc \u06a9\u0631\u062f\u0646
            </button>
          </div>
          <div className="space-y-3">
            {recentAudits.slice(0, 5).map((audit, index) => (
              <div 
                key={audit.id} 
                className="flex items-center gap-3 p-3 bg-background-tertiary/30 rounded-lg border border-border-gold/10 hover:bg-background-tertiary/50 transition-colors animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-8 h-8 rounded-full bg-gold-900/20 flex items-center justify-center text-gold-primary text-sm font-bold">
                  {audit.action.slice(0, 1).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">
                    {audit.action}
                  </div>
                  <div className="text-xs text-text-secondary">
                    {audit.entityType} \u2022 {formatPersianDate(audit.createdAt)}
                  </div>
                </div>
                {audit.actor && (
                  <div className="text-xs text-text-secondary whitespace-nowrap">
                    {audit.actor.firstName || audit.actor.phone?.slice(-4)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {showAudits && recentAudits.length === 0 && (
        <div className={`glass-card ${cardBg} ${cardBorder} rounded-2xl p-6 text-center`}>
          <div className="text-4xl mb-2">\ud83d\udcca</div>
          <p className="text-text-secondary">\u0647\u06cc\u0686 \u0641\u0639\u0627\u0644\u06cc\u062a \u0627\u062e\u06cc\u0631\u06cc \u06cc\u0627\u0641\u062a \u0646\u0634\u062f</p>
        </div>
      )}
    </div>
  );
}
