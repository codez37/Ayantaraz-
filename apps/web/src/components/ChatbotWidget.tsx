'use client';

import { useState, useRef, useEffect } from 'react';
import { chatbot } from '@/lib/chatbot';

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const newSessionId = chatbot.startSession();
    setSessionId(newSessionId);
    setMessages([{ id: 'welcome', content: 'سلام! چطور میتونم کمکتون کنم؟', sender: 'bot', timestamp: new Date() }]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = { id: Date.now().toString(), content: inputValue.trim(), sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const result = await chatbot.processMessage(sessionId, inputValue);
      const botMessage = { id: (Date.now() + 1).toString(), content: result.response, sender: 'bot', timestamp: new Date() };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = { id: (Date.now() + 2).toString(), content: 'متاسفم، خطایی رخ داد.', sender: 'bot', timestamp: new Date() };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)} className="fixed bottom-6 left-6 z-50 flex flex-col items-center gap-1">
        <div className="w-14 h-14 bg-gradient-to-br from-[#FFD700] to-[#FFA000] rounded-full flex items-center justify-center shadow-lg shadow-[#FFD700]/30">
          <svg className="w-7 h-7 text-[#0a0a0a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <span className="text-xs text-gray-400">Chat</span>
      </button>

      {isOpen && (
        <div className="fixed bottom-20 left-6 z-50 w-80 max-w-[90vw] h-[70vh] bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl shadow-xl flex flex-col">
          <div className="h-14 border-b border-[#2a2a2a] flex items-center justify-between px-4">
            <span className="font-semibold">Support</span>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">X</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div key={message.id} className={message.sender === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div className={message.sender === 'user' ? 'bg-[#FFD700] text-[#0a0a0a] rounded-lg rounded-br-none p-3 max-w-[80%]' : 'bg-[#2a2a2a] text-white rounded-lg rounded-bl-none p-3 max-w-[80%]'}>
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#2a2a2a] p-3 rounded-lg rounded-bl-none">
                  <div className="animate-pulse flex space-x-1">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-3 border-t border-[#2a2a2a]">
            <div className="flex gap-2">
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="flex-1 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD700]"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="bg-[#FFD700] text-[#0a0a0a] px-4 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#FFC107] transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatbotWidget;
