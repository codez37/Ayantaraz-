// Chatbot Module - Professional Rule-Based Engine

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const knowledgeBase = [
  { intent: 'greeting', patterns: ['سلام', 'درود', 'hi', 'hello'], responses: ['سلام! چطور میتونم کمکتون کنم؟'] },
  { intent: 'tax_info', patterns: ['مالیات چیست', 'درباره مالیات'], responses: ['مالیات هزینه‌ای است که دولت از افراد و کسب و کارها دریافت می‌کند.'] },
];

export function recognizeIntent(message: string) {
  const lowerMsg = message.toLowerCase();
  for (const entry of knowledgeBase) {
    for (const pattern of entry.patterns) {
      if (lowerMsg.includes(pattern)) return entry.intent;
    }
  }
  return 'fallback';
}

export function generateResponse(intent: string): string {
  const entry = knowledgeBase.find(e => e.intent === intent);
  if (entry && entry.responses.length > 0) {
    return entry.responses[0];
  }
  return 'متوجه نشدم. لطفا سوال خود را واضح‌تر بیان کنید.';
}

export class Chatbot {
  private sessionId: string;
  constructor() { this.sessionId = Math.random().toString(36).substring(2); }
  
  processMessage(message: string): { response: string; intent: string } {
    const intent = recognizeIntent(message);
    const response = generateResponse(intent);
    return { response, intent };
  }
}

export const chatbot = new Chatbot();
