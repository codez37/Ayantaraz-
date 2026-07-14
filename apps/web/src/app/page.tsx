'use client';

import { ChatbotWidget } from '@/components/ChatbotWidget';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Welcome to Ayantaraz</h1>
        <p className="text-lg text-gray-300 mb-8">
          Professional tax consultation platform with modern design and Persian support.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: 'Tax Consultation', desc: 'Expert tax advice' },
            { title: 'Courses', desc: 'Educational content' },
            { title: 'Support', desc: '24/7 support' },
          ].map((card, index) => (
            <div key={index} className="bg-[#1a1a1a] p-6 rounded-lg border border-[#2a2a2a] hover:border-[#FFD700] transition-colors">
              <h3 className="text-xl font-semibold mb-2">{card.title}</h3>
              <p className="text-gray-400">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <ChatbotWidget />
    </main>
  );
}
