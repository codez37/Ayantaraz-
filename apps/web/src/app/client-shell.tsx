'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/lib/auth';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ChatbotWidget from '@/components/chatbot/ChatbotWidget';

export default function ClientShell({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <Header />
      <main className="min-h-screen bg-[#0B0B0C] text-white">{children}</main>
      <Footer />
      <ChatbotWidget />
    </AuthProvider>
  );
}
