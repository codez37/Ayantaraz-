'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useGlassmorphicTheme } from '@/providers/GlassmorphicThemeProvider';

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
  status?: 'sending' | 'delivered' | 'error';
}

const GREETING_RESPONSES = [
  '\u0633\u0644\u0627\u0645! \u0645\u0646 \u0633\u0627\u0645\u0627\u0646\u0647 \u0647\u0648\u0634\u0645\u0646\u062f \u067e\u0627\u0633\u062e\u0648\u06cc\u06cc \u0645\u0627\u0644\u06cc\u0627\u062a\u06cc \u0622\u06cc\u0627\u0646 \u062a\u0631\u0627\u0632 \u0647\u0633\u062a\u0645. \u0645\u06cc\u200c\u062a\u0648\u0627\u0646\u0645 \u0628\u0647 \u0633\u0648\u0627\u0644\u0627\u062a \u0634\u0645\u0627 \u0628\u0633\u0627\u0646\u06cc\u0645 \u0642\u0648\u0627\u0646\u06cc\u0646 \u0648 \u0645\u0642\u0631\u0631\u0627\u062a \u067e\u0627\u0633\u062e \u062f\u0647\u0645.',
  '\u062f\u0631 \u062e\u062f\u0645\u062a \u0634\u0645\u0627 \u0647\u0633\u062a\u0645. \u0633\u0627\u0645\u0627\u0646\u0647 \u067e\u0631\u0633\u0634 \u0648 \u067e\u0627\u0633\u062e \u0622\u06cc\u0627\u0646 \u062a\u0631\u0627\u0632 \u0622\u0645\u0627\u062f\u0647 \u067e\u0631\u0633\u062e\u0648\u06cc\u06cc \u0628\u0647 \u0633\u0648\u0627\u0644\u0627\u062a \u0645\u0627\u0644\u06cc\u0627\u062a\u06cc \u0648 \u062d\u0633\u0627\u0628\u062f\u0627\u0631\u06cc \u0634\u0645\u0627 \u0627\u0633\u062a.',
  '\u0633\u0644\u0627\u0645. \u0628\u0631\u0627\u06cc \u0633\u0648\u0627\u0644\u0627\u062a \u0645\u0627\u0644\u06cc\u0627\u062a\u06cc\u060c \u062d\u0633\u0627\u0628\u062f\u0627\u0631\u06cc\u060c \u062a\u0646\u0638\u06cc\u0645 \u0627\u0638\u0647\u0627\u0631\u0646\u0627\u0645\u0647 \u0648 \u0645\u0634\u0627\u0648\u0631\u0647 \u0645\u0627\u0644\u06cc \u062f\u0631 \u062e\u062f\u0645\u062a \u0634\u0645\u0627 \u0647\u0633\u062a\u0645.',
  '\u0628\u0627 \u0633\u0644\u0627\u0645. \u0645\u0646 \u0686\u062a\u200c\u0628\u0627\u062a \u062a\u062e\u0635\u0635\u06cc \u0645\u0627\u0644\u06cc\u0627\u062a \u0648 \u062d\u0633\u0627\u0628\u062f\u0627\u0631\u06cc \u0647\u0633\u062a\u0645. \u0633\u0648\u0627\u0644\u0627\u062a \u062e\u0648\u062f \u0631\u0627 \u0628\u067e\u0631\u0633\u06cc\u062f.',
];

const FALLBACK_MESSAGES = [
  '\u0628\u0631\u0627\u06cc \u0627\u06cc\u0646 \u0633\u0648\u0627\u0644 \u0645\u0633\u062a\u0646\u062f \u06a9\u0627\u0641\u06cc \u062f\u0631 \u062f\u0627\u0646\u0634\u0646\u0627\u0647 \u0641\u0639\u0627\u0644 \u067e\u06cc\u062f\u0627 \u0646\u0634\u0646\u062f. \u0627\u06af\u0631 \u0633\u0627\u0644 \u0645\u0627\u0644\u06cc\u060c \u0645\u0628\u0644\u063a\u060c \u0646\u0648\u0639 \u06a9\u0633\u0628\u200c\u0648\u06a9\u0627\u0631 \u0648 \u0645\u0644\u062d\u0647 \u067e\u0631\u0648\u0646\u062f\u0647 \u0631\u0627 \u0627\u0636\u0627\u0641\u0647 \u06a9\u0646\u06cc\u062f \u062f\u0642\u06cc\u0642\u060c\u062a\u0631 \u0631\u0627\u0647\u0645\u0646\u0627\u06cc\u06cc \u0645\u06cc\u200c\u06a9\u0646\u0646\u062f.',
  '\u0627\u06cc\u0646 \u0645\u0648\u0636\u0648\u0639 \u0628\u0647 \u0627\u0637\u0644\u0627\u0639\u0627\u062a \u067e\u0631\u0648\u0646\u062f\u0647 \u0648\u0627\u0628\u0633\u062a\u0647 \u0627\u0633\u062a. \u0645\u0633\u06cc\u0644 \u0627\u0646\u0626: \u062c\u0632\u0626\u06cc\u0627\u062a \u0631\u0627 \u06a9\u0627\u0645\u0644\u200c\u062a\u0631 \u0628\u0641\u0631\u0633\u062a\u06cc\u062f \u06cc\u0627 \u0627\u0632 \u0641\u0644\u0647 \u0645\u062f\u0627\u0648\u0646\u0627\u062a \u0627\u0633\u062a\u0641\u0627\u062f\u0647 \u06a9\u0646\u06cc\u062f.',
  '\u0628\u0631\u0627\u06cc \u067e\u0627\u0633\u062e \u062f\u0642\u06cc\u0642\u060c\u062a\u0631 \u0633\u0648\u0627\u0644 \u0631\u0627 \u0628\u0627 \u0633\u0627\u062e\u062a\u0627\u0644 \u0631\u0627 \u0634\u062e\u0635 \u062d\u0642\u06cc\u0642\u06cc/\u062d\u0642\u0648\u0642\u06cc\u060c \u0645\u0628\u0644\u063a \u0648 \u0647\u062f\u0641 \u0627\u0642\u0641\u0627\u0645 \u0627\u0636\u0627\u0641\u0647 \u06a9\u0646\u06cc\u062f.',
  '\u067e\u0627\u0633\u062e \u0642\u0648\u0627\u0646\u06cc\u0646 \u0628\u062f\u0648\u0646 \u0645\u0633\u0626\u0646\u0627\u062a \u06a9\u0627\u0641\u06cc \u0645\u0645\u06a9\u0646 \u0646\u06cc\u0633\u062a\u061b \u0644\u0637\u0641\u0627\u064b \u062f\u0627\u0626\u0641\u0647 \u0627\u0632 \u0627\u0636\u0627\u0641\u0647 \u06a9\u0646\u06cc\u062f \u062a\u0627 \u067e\u0627\u0633\u062e \u062d\u0641\u0641\u0647\u060c\u0627\u06cc\u060c\u062a\u0631 \u0627\u0631\u0627\u0626\u0647 \u0634\u0648\u062f.',
];

const SUGGESTED_QUESTIONS = [
  '\u0645\u0627\u0644\u06cc\u0627\u062a \u0628\u0631 \u0627\u0631\u0632\u0634 \u0627\u0641\u0632\u0648\u062f\u0647 \u0686\u0648\u0646\u0647 \u0645\u062d\u0627\u0633\u0628\u0647 \u0645\u06cc\u060c\u0634\u0648\u062f\u061f',
  '\u0645\u062f\u0627\u0631\u06a9 \u0644\u0627\u0632\u0645 \u0628\u0631\u0627\u06cc \u062a\u0646\u0638\u06cc\u0645 \u0627\u0638\u0647\u0627\u0631\u0646\u0627\u0645\u06cc \u0645\u0627\u0644\u06cc\u0627\u062a\u06cc \u0686\u06cc\u0633\u062a\u061f',
  '\u0645\u0639\u0627\u0641\u06cc\u0627\u0646\u060c\u0647\u0627\u06cc \u0645\u0627\u0644\u06cc\u0627\u062a\u06cc \u0634\u0627\u0626\u0644 \u0686\u0647 \u0645\u0648\u0627\u0631\u062f \u0645\u06cc\u200c\u0634\u0648\u062f\u061f',
  '\u062a\u0641\u0627\u0648\u062a \u062d\u0633\u0627\u0628\u062f\u0627\u0631\u06cc \u0635\u0646\u0639\u062a\u06cc \u0648 \u0645\u0627\u0644\u06cc \u062f\u0631 \u0686\u06cc\u0633\u062a\u061f',
  '\u0686\u0648\u0646\u0647 \u0645\u0646\u062a\u0644\u0645 \u0645\u0627\u0644\u06cc\u0627\u062a \u062e\u0648\u062f \u0631\u0627 \u06a9\u0647 \u0634 \u062f\u0647\u0645\u061f',
  '\u0645\u0647\u0644\u062a \u0627\u0631\u0632\u0634 \u0627\u0638\u0647\u0627\u0631\u0646\u0627\u0645\u0647 \u0645\u0627\u0644\u06cc\u0627\u062a\u06cc \u0686\u0647 \u0632\u0645\u0627\u0646\u06cc \u0627\u0633\u062a\u061f',
];

export default function ChatbotWidget() {
  const { theme } = useGlassmorphicTheme();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial',
      role: 'bot',
      content: GREETING_RESPONSES[0],
      timestamp: new Date(),
      status: 'delivered',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open]);

  const generateId = useCallback(() => {
    return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }, []);

  const formatTime = useCallback((date: Date): string => {
    return date.toLocaleTimeString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }, []);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const question = input.trim();
    setInput('');
    setError(null);
    setShowSuggestions(false);
    
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: question,
      timestamp: new Date(),
      status: 'delivered',
    };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await api.post<{ answer: string; source?: string; riskLevel?: string }>(
        '/chatbot/query',
        { question },
      );

      const botMessage: Message = {
        id: generateId(),
        role: 'bot',
        content: res.answer || FALLBACK_MESSAGES[0],
        timestamp: new Date(),
        status: 'delivered',
      };
      setMessages((prev) => [...prev, botMessage]);
      
      if (res.source === 'fallback') {
        setShowSuggestions(true);
      }
    } catch (err) {
      setError('\u062e\u0637\u0627\u06cc\u06cc \u0631\u062e \u062f\u0627\u062f. \u0644\u0637\u0641\u0627\u064b \u062f\u0648\u0628\u0627\u0631\u0647 \u062a\u0644\u0627\u0633\u0646 \u06a9\u0646\u06cc\u062f.');
      const errorMessage: Message = {
        id: generateId(),
        role: 'bot',
        content: '\u0645\u062a\u0622\u0633\u0641\u0646\u0647 \u062e\u0637\u0627\u06cc\u06cc \u062f\u0631 \u0627\u0631\u062a\u0628\u0627\u0637 \u0628\u0627 \u0633\u06cc\u0631 \u062b \u062f\u0627\u062f. \u0644\u0637\u0641\u0627\u064b \u062f\u0648\u0628\u0627\u0631\u0647 \u062a\u0644\u0627\u0633 \u06a9\u0646\u06cc\u062f.',
        timestamp: new Date(),
        status: 'error',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestedClick = (question: string) => {
    setInput(question);
    setShowSuggestions(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: generateId(),
        role: 'bot',
        content: '\u06af\u0641\u062a\u06af\u0648\u06cc \u062c\u062f\u06cc\u062f \u0634\u0631\u0648\u0639 \u0634\u062f. \u0686\u06af\u0648\u0646\u0647 \u0645\u06cc\u200c\u062a\u0648\u0627\u0646\u0645 \u0628\u0647 \u0634\u0645\u0627 \u06a9\u0645\u06a9 \u06a9\u0646\u0645\u061f',
        timestamp: new Date(),
        status: 'delivered',
      },
    ]);
    setInput('');
    setError(null);
    setShowSuggestions(true);
  };

  const handleChatClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Modern Black Gold color scheme
  const isDark = theme === 'dark';
  const chatHeaderBg = isDark 
    ? 'bg-gradient-to-l from-gold-primary to-gold-500' 
    : 'bg-gradient-to-l from-gold-600 to-gold-700';
  const chatHeaderText = isDark ? 'text-background-primary' : 'text-white';
  const chatBg = isDark ? 'bg-background-secondary' : 'bg-background-primary';
  const chatInputBg = isDark ? 'bg-background-tertiary' : 'bg-surface/80';
  const messageUserBg = isDark ? 'bg-background-tertiary' : 'bg-surface/60';
  const messageBotBg = isDark 
    ? 'bg-gold-900/10 border-gold-800/20' 
    : 'bg-gold-700/10 border-gold-700/20';

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => {
          setOpen(!open);
          if (!open) setShowSuggestions(true);
        }}
        className="fixed bottom-6 left-6 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-gold-primary to-gold-500 text-2xl text-background-primary shadow-lg shadow-gold-primary/20 transition-all duration-300 hover:scale-105 hover:shadow-gold-primary/40 active:scale-95"
        aria-label="\u0686\u062a\u060c\u0628\u0648\u062a \u0645\u0627\u0644\u06cc\u0627\u062a\u06cc"
        title="\u067e\u0631\u0633\u0634 \u0648 \u067e\u0627\u0633\u062e \u0645\u0627\u0644\u06cc\u0627\u062a\u06cc"
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
        {messages.length > 1 && !open && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold-primary text-background-primary text-xs font-bold rounded-full flex items-center justify-center animate-pulse-gold">
            {messages.filter(m => m.role === 'user').length}
          </span>
        )}
      </button>

      {/* Chat Panel */}
      {open && (
        <div
          onClick={handleChatClick}
          className="glass-card fixed bottom-24 left-6 z-[60] flex h-[560px] max-h-[calc(100vh-200px)] w-[380px] max-w-[calc(100vw-48px)] flex-col overflow-hidden rounded-3xl safe-area-bottom border-border-gold"
        >
          {/* Header */}
          <div className={`${chatHeaderBg} p-4 flex items-center justify-between flex-shrink-0`}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-lg backdrop-blur-sm">
                \u2696\ufe0f
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-bold ${chatHeaderText} text-sm truncate`}>
                  \u067e\u0631\u0633\u0634 \u0648 \u067e\u0627\u0633\u062e \u0645\u0627\u0644\u06cc\u0627\u062a\u06cc
                </h3>
                <p className={`text-xs truncate ${chatHeaderText}/70`}>
                  \u067e\u0631\u0633\u062e\u0648\u06cc\u06cc \u0628\u0631 \u0627\u0633\u0627\u0633 \u062f\u0627\u0646\u0634\u0646\u0627\u0647 \u062a\u062e\u0635\u0635\u06cc
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                className={`text-background-primary/60 hover:text-background-primary transition-colors p-1.5 rounded-lg hover:bg-white/20`}
                title="\u067e\u0627\u06a9 \u06a9\u0644\u06cc\u062f \u06af\u0641\u062a\u06af\u0648"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <button
                onClick={() => setOpen(false)}
                className={`text-background-primary/60 hover:text-background-primary transition-colors p-1.5 rounded-lg hover:bg-white/20`}
                title="\u0628\u0633\u062a\u0646"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className={`flex-1 overflow-y-auto p-4 space-y-3 ${chatBg} custom-scrollbar`} onClick={(e) => e.stopPropagation()}>
            {error && (
              <div className="bg-gold-700/10 border border-gold-700/30 text-gold-primary p-3 rounded-xl text-sm text-center animate-fade-in">
                {error}
              </div>
            )}

            {messages.map((msg, i) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'} animate-fade-in-up`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed relative ${msg.role === 'user' ? `${messageUserBg} text-text-primary rounded-br-md border border-border-gold/30` : `${messageBotBg} text-text-primary rounded-bl-md border`}`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <span className={`absolute bottom-1 text-[10px] opacity-50 ${msg.role === 'user' ? 'left-3' : 'right-3'}`}>
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-end">
                <div className={`${messageBotBg} p-3 rounded-2xl rounded-bl-md border`}>
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-gold-primary rounded-full animate-bounce bounce-delay-0" />
                    <div className="w-2 h-2 bg-gold-primary rounded-full animate-bounce bounce-delay-150" />
                    <div className="w-2 h-2 bg-gold-primary rounded-full animate-bounce bounce-delay-300" />
                  </div>
                </div>
              </div>
            )}

            {showSuggestions && messages.length <= 2 && (
              <div className="space-y-2 pt-2 animate-fade-in">
                <p className="text-[11px] text-text-secondary text-center">\u067e\u06cc\u0634\u0646\u0647\u0627\u064f \u0645\u0627:</p>
                <div className="grid grid-cols-1 gap-2">
                  {SUGGESTED_QUESTIONS.slice(0, 3).map((q, i) => (
                    <button 
                      key={i} 
                      onClick={() => handleSuggestedClick(q)} 
                      className="w-full text-left bg-background-tertiary/50 border border-border-gold/20 text-text-secondary p-2.5 rounded-xl text-xs hover:bg-background-tertiary/80 hover:border-border-gold/40 hover:text-text-primary transition-all truncate"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-border-gold/30 p-3 bg-background-secondary flex gap-2 flex-shrink-0">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="\u0633\u0648\u0627\u0644 \u062e\u0648\u062f \u0631\u0627 \u062f\u0646\u0628\u0627\u0644\u0647 \u0645\u0627\u0644\u06cc\u0627\u062a\u060c \u062d\u0633\u0627\u0628\u062f\u0627\u0631\u06cc \u06cc\u0627 \u0642\u0648\u0627\u0646\u06cc\u0646 \u0628\u067e\u0631\u0633\u06cc\u062f..."
              className={`flex-1 ${chatInputBg} border border-border-gold/40 text-text-primary p-2.5 rounded-xl text-sm focus:outline-none focus:border-gold-primary focus:ring-2 focus:ring-gold-primary/20 placeholder:text-text-tertiary transition-all`}
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-gradient-to-l from-gold-primary to-gold-500 text-background-primary px-4 py-2.5 rounded-xl text-sm font-bold hover:shadow-gold-md disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m0 0l-7 7m7-7l7 7" />
              </svg>
            </button>
          </div>

          <div className="text-center py-2 text-[10px] text-text-tertiary bg-background-secondary/50">
            \u0633\u0627\u0645\u0627\u0646\u0647 \u0647\u0648\u0634\u0645\u0646\u062f \u067e\u0627\u0633\u062e\u0648\u06cc\u06cc \u0622\u06cc\u0627\u0646 \u062a\u0631\u0627\u0632
          </div>
        </div>
      )}

      {/* Backdrop Overlay */}
      {open && (
        <div className="fixed inset-0 z-[55] bg-black/30 backdrop-blur-sm transition-opacity duration-300" onClick={() => setOpen(false)} aria-hidden="true" />
      )}
    </>
  );
}
