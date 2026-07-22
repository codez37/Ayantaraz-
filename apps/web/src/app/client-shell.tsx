'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/lib/auth';
import { QueryClientProvider } from '@/providers/QueryClientProvider';
import { ToastProvider } from '@/providers/ToastProvider';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ChatbotWidget from '@/components/chatbot/ChatbotWidget';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

export default function ClientShell({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <QueryClientProvider>
        <ToastProvider>
          <AuthProvider>
            <Header />
            <main className="min-h-screen bg-[#0B0B0C] text-white">{children}</main>
            <Footer />
            <ChatbotWidget />
          </AuthProvider>
        </ToastProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
