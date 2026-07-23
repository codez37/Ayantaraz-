'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { Order, ConsultationRequest } from '@/types';

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: '\u062f\u0631 \u0627\u0646\u062a\u0638\u0627\u0631', color: 'text-gold-primary bg-gold-primary/10' },
  waiting_for_call: { label: '\u0645\u0646\u062a\u0638\u0631 \u062a\u0645\u0627\u0633', color: 'text-gold-primary bg-gold-primary/10' },
  waiting_for_payment: { label: '\u0645\u0646\u062a\u0638\u0631 \u067e\u0631\u062f\u0627\u062e\u062a', color: 'text-orange-400 bg-orange-900/20' },
  confirmed: { label: '\u062a\u0627\u06cc\u06cc\u062f \u0634\u062f\u0647', color: 'text-green-400 bg-green-900/20' },
  rejected: { label: '\u0631\u062f \u0634\u062f\u0647', color: 'text-red-400 bg-red-900/20' },
  canceled: { label: '\u0644\u063a\u0648 \u0634\u062f\u0647', color: 'text-text-tertiary bg-background-tertiary/30' },
  contacted: { label: '\u062a\u0645\u0627\u0633 \u06af\u0641\u0644\u062a \u0634\u062f\u0647', color: 'text-blue-400 bg-blue-900/20' },
  completed: { label: '\u0627\u0646\u062c\u0627\u0645 \u0634\u062f\u0647', color: 'text-green-400 bg-green-900/20' },
};

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [consultations, setConsultations] = useState<ConsultationRequest[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [consultLoading, setConsultLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) { router.push('/auth'); }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    api.get<Order[]>('/orders')
      .then(setOrders)
      .catch(() => {})
      .finally(() => setOrdersLoading(false));
    api.get<ConsultationRequest[]>('/consultation')
      .then(setConsultations)
      .catch(() => {})
      .finally(() => setConsultLoading(false));
  }, []);

  if (authLoading) return <div className="text-center py-16"><div className="animate-spin h-8 w-8 border-4 border-gold-primary border-t-transparent rounded-full mx-auto" /></div>;
  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-black text-gold-gradient mb-8">\u062f\u0627\u0633\u0628\u0648\u0631\u062f</h1>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Link href="/dashboard/orders" className="card-dark p-4">
          <div className="text-2xl font-bold text-gold-primary">{orders.length}</div>
          <div className="text-sm text-text-secondary">\u0633\u0641\u0627\u0631\u0634\u060c\u0647\u0627</div>
        </Link>
        <Link href="/dashboard/consultations" className="card-dark p-4">
          <div className="text-2xl font-bold text-gold-primary">{consultations.length}</div>
          <div className="text-sm text-text-secondary">\u0645\u0634\u0627\u0648\u0631\u0627\u062a\u060c\u0647\u0627</div>
        </Link>
        <Link href="/dashboard/courses" className="card-dark p-4">
          <div className="text-2xl font-bold text-gold-primary">-</div>
          <div className="text-sm text-text-secondary">\u062f\u0648\u0631\u0647\u060c\u0647\u0627</div>
        </Link>
        <Link href="/dashboard/profile" className="card-dark p-4">
          <div className="text-2xl font-bold text-gold-primary">{user.firstName || '---'}</div>
          <div className="text-sm text-text-secondary">\u067e\u0631\u0648\u0641\u0627\u06cc\u0644</div>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-background-secondary p-6 rounded-xl border border-border-gold/10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-white">\u0633\u0641\u0627\u0631\u0634\u060c\u0647\u0627\u06cc \u0627\u062e\u06cc\u0631</h2>
            <Link href="/dashboard/orders" className="text-sm text-gold-primary hover:text-gold-400">\u0645\u0634\u0627\u0647\u062f\u0647 \u0647\u0645\u0647</Link>
          </div>
          {ordersLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 bg-background-tertiary rounded animate-pulse" />)}</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-text-tertiary">
              <p>\u0647\u0646\u0648\u0632 \u0633\u0641\u0627\u0631\u0634 \u062b\u0628\u062a \u0646\u06a9\u0631\u062f\u0647\u060c\u0627\u06cc\u062f.</p>
              <Link href="/courses" className="text-gold-primary text-sm hover:text-gold-400">\u0645\u0634\u0627\u0647\u062f\u0647 \u062f\u0648\u0631\u0647\u060c\u0647\u0627</Link>
            </div>
          ) : (
            orders.slice(0, 5).map(order => (
              <div key={order.id} className="flex justify-between items-center py-3 border-b border-border-gold/10 last:border-0">
                <div>
                  <span className="text-sm text-text-secondary">{order.itemType === 'course' ? '\u062f\u0648\u0631\u0647 \u0622\u0645\u0648\u0632\u0634\u06cc' : '\u0645\u0634\u0627\u0648\u0631\u0647'}</span>
                  <span className="text-xs text-text-tertiary mr-2">{order.amount.toLocaleString()} \u0631\u06cc\u0627\u0644</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${statusMap[order.status]?.color || 'text-text-tertiary'}`}>
                  {statusMap[order.status]?.label || order.status}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="bg-background-secondary p-6 rounded-xl border border-border-gold/10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-white">\u062f\u0631\u062e\u0648\u0627\u0633\u062a\u060c\u0647\u0627\u06cc \u0645\u0634\u0627\u0648\u0631\u0647</h2>
            <Link href="/dashboard/consultations" className="text-sm text-gold-primary hover:text-gold-400">\u0645\u0634\u0627\u0647\u062f\u0647 \u0647\u0645\u0647</Link>
          </div>
          {consultLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 bg-background-tertiary rounded animate-pulse" />)}</div>
          ) : consultations.length === 0 ? (
            <div className="text-center py-8 text-text-tertiary">
              <p>\u0647\u0646\u0648\u0632 \u062f\u0631\u062e\u0648\u0627\u0633\u062a \u0645\u0634\u0627\u0648\u0631\u0647\u060c\u0627\u06cc \u062b\u0628\u062a \u0646\u06a9\u0631\u062f\u0647\u060c\u0627\u06cc\u062f.</p>
              <Link href="/consultation" className="text-gold-primary text-sm hover:text-gold-400">\u062f\u0631\u062e\u0648\u0627\u0633\u062a \u0645\u0634\u0627\u0648\u0631\u0647</Link>
            </div>
          ) : (
            consultations.slice(0, 5).map(c => (
              <div key={c.id} className="flex justify-between items-center py-3 border-b border-border-gold/10 last:border-0">
                <span className="text-sm text-text-secondary">
                  {c.requestType === 'tax' ? '\u0645\u0627\u0644\u06cc\u0627\u062a\u06cc' : c.requestType === 'accounting' ? '\u062d\u0633\u0627\u0628\u062f\u0627\u0631\u06cc' : '\u0639\u0645\u0648\u0645\u06cc'}
                </span>
                <span className={`text-xs px-2 py-1 rounded ${statusMap[c.status]?.color || 'text-text-tertiary'}`}>
                  {statusMap[c.status]?.label || c.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
