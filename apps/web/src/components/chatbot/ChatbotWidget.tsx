'use client';

import { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/api';

interface Message {
  role: 'user' | 'bot';
  content: string;
}

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', content: 'سلام! من سامانه پاسخگویی آیان تراز هستم. می‌توانم به سوالات مالیاتی شما بر اساس دانشنامه پاسخ دهم. برای مشاوره تخصصی، از صفحه مشاوره اقدام کنید.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const question = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: question }]);
    setLoading(true);

    try {
      const res = await api.post<{ answer: string }>('/chatbot/query', { question });
      setMessages(prev => [...prev, { role: 'bot', content: res.answer }]);
    } catch {
      setMessages(prev => [...prev, { role: 'bot', content: 'متأسفم، خطایی رخ داد. لطفاً دوباره تلاش کنید.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 left-6 z-50 bg-gradient-to-br from-[#D4A843] to-[#B8862D] text-[#111111] w-14 h-14 rounded-full shadow-lg hover:shadow-[#D4A843]/30 transition-all flex items-center justify-center text-2xl animate-pulse-glow"
        aria-label="چت‌بات"
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {open && (
        <div className="fixed bottom-24 left-6 z-50 w-[360px] max-w-[calc(100vw-48px)] bg-[#111111] rounded-2xl shadow-2xl border border-[#D4A843]/20 flex flex-col h-[520px] max-h-[calc(100vh-200px)] overflow-hidden">
          <div className="bg-gradient-to-l from-[#D4A843] to-[#B8862D] p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-lg">⚖️</div>
            <div className="flex-1">
              <h3 className="font-bold text-[#111111] text-sm">پرسش و پاسخ مالیاتی</h3>
              <p className="text-[#111111]/70 text-xs">پاسخگویی بر اساس دانشنامه</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-[#111111]/60 hover:text-[#111111]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#1A1A1A]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#111111] text-gray-200 rounded-br-md'
                    : 'bg-[#D4A843]/10 border border-[#D4A843]/20 text-gray-200 rounded-bl-md'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-end">
                <div className="bg-[#D4A843]/10 border border-[#D4A843]/20 p-3 rounded-2xl rounded-bl-md">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-[#D4A843] rounded-full animate-bounce bounce-delay-0" />
                    <div className="w-2 h-2 bg-[#D4A843] rounded-full animate-bounce bounce-delay-150" />
                    <div className="w-2 h-2 bg-[#D4A843] rounded-full animate-bounce bounce-delay-300" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-[#D4A843]/10 p-3 bg-[#111111] flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="سوال خود را بپرسید..."
              className="flex-1 bg-[#1A1A1A] border border-[#D4A843]/20 text-gray-200 p-2.5 rounded-xl text-sm focus:outline-none focus:border-[#D4A843] placeholder-gray-600"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-gradient-to-l from-[#D4A843] to-[#B8862D] text-[#111111] px-4 py-2.5 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-[#D4A843]/20 disabled:opacity-50 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m0 0l-7 7m7-7l7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
