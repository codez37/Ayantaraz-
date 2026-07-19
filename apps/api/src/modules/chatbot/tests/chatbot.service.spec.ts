jest.mock('persian-tools', () => ({
  removeDiacritics: (s: string) => s,
  normalizePersian: (s: string) => s,
  extractPersianNumbers: (s: string) => s,
}));

import { Test, TestingModule } from '@nestjs/testing';
import { ChatbotService } from '../chatbot.service';
import { PrismaService } from '../../../prisma/prisma.service';

describe('ChatbotService', () => {
  let service: ChatbotService;

  const mockPrisma = {
    chatConversation: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    chatMessage: { create: jest.fn() },
    knowledgeBase: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    content: { findMany: jest.fn() },
    escalationTicket: { create: jest.fn() },
    auditLog: { create: jest.fn() },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatbotService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<ChatbotService>(ChatbotService);
  });

  describe('risk classification', () => {
    it('should classify normal question as low risk', async () => {
      mockPrisma.chatConversation.findUnique.mockResolvedValue({
        id: 1,
        sessionId: 'test',
      });
      mockPrisma.chatConversation.create.mockResolvedValue({
        id: 1,
        sessionId: 'test',
      });
      mockPrisma.knowledgeBase.findMany.mockResolvedValue([
        { question: 'مالیات چیست', answer: 'Tax answer' },
      ]);

      const result = await service.query('مالیات چیست');
      expect(result.riskLevel).toBe('low');
    });

    it('should classify evasion question as forbidden', async () => {
      mockPrisma.chatConversation.findUnique.mockResolvedValue({
        id: 1,
        sessionId: 'test',
      });
      mockPrisma.chatConversation.create.mockResolvedValue({
        id: 1,
        sessionId: 'test',
      });

      const result = await service.query('راه فرار مالیاتی');
      expect(result.source).toBe('refused');
    });

    it('should classify forbidden question with refusal message', async () => {
      mockPrisma.chatConversation.findUnique.mockResolvedValue({
        id: 1,
        sessionId: 'test',
      });
      mockPrisma.chatConversation.create.mockResolvedValue({
        id: 1,
        sessionId: 'test',
      });

      const result = await service.query('چطور جعل کنم');
      expect(result.answer).toContain('مجاز');
    });
  });

  describe('answer retrieval', () => {
    it('should return KB answer when match found', async () => {
      mockPrisma.chatConversation.findUnique.mockResolvedValue({
        id: 1,
        sessionId: 'test',
      });
      mockPrisma.chatConversation.create.mockResolvedValue({
        id: 1,
        sessionId: 'test',
      });
      mockPrisma.knowledgeBase.findMany.mockResolvedValue([
        { question: 'ارزش افزوده', answer: 'Value added tax is...', id: 1 },
      ]);
      mockPrisma.content.findMany.mockResolvedValue([]);

      const result = await service.query('مالیات بر ارزش افزوده چیست');
      expect(result.source).toContain('knowledge_base');
      expect(result.answer).toBeTruthy();
    });

    it('should return FAQ answer when KB has no match', async () => {
      mockPrisma.chatConversation.findUnique.mockResolvedValue({
        id: 1,
        sessionId: 'test',
      });
      mockPrisma.chatConversation.create.mockResolvedValue({
        id: 1,
        sessionId: 'test',
      });
      mockPrisma.knowledgeBase.findMany.mockResolvedValue([]);
      mockPrisma.content.findMany
        .mockResolvedValueOnce([
          { title: 'FAQ', body: 'FAQ answer', id: 1, contentType: 'faq' },
        ])
        .mockResolvedValueOnce([]);

      const result = await service.query('FAQ');
      expect(result.source).toContain('faq');
    });

    it('should fallback when no answer found for low risk', async () => {
      mockPrisma.chatConversation.findUnique.mockResolvedValue({
        id: 1,
        sessionId: 'test',
      });
      mockPrisma.chatConversation.create.mockResolvedValue({
        id: 1,
        sessionId: 'test',
      });
      mockPrisma.knowledgeBase.findMany.mockResolvedValue([]);
      mockPrisma.content.findMany.mockResolvedValue([]);

      const result = await service.query('random unknown question');
      expect(result.source).toBe('fallback');
    });

    it('should add disclaimer for medium risk', async () => {
      mockPrisma.chatConversation.findUnique.mockResolvedValue({
        id: 1,
        sessionId: 'test',
      });
      mockPrisma.chatConversation.create.mockResolvedValue({
        id: 1,
        sessionId: 'test',
      });
      mockPrisma.knowledgeBase.findMany.mockResolvedValue([
        { question: 'نرخ مالیات', answer: 'Rate info', id: 1 },
      ]);

      const result = await service.query('نرخ مالیات بر درآمد');
      expect(result.answer).toContain('تخصصی');
    });
  });

  describe('escalation', () => {
    it('should escalate high risk questions with no KB match', async () => {
      mockPrisma.chatConversation.findUnique.mockResolvedValue({
        id: 1,
        sessionId: 'test',
      });
      mockPrisma.chatConversation.create.mockResolvedValue({
        id: 1,
        sessionId: 'test',
      });
      mockPrisma.knowledgeBase.findMany.mockResolvedValue([]);
      mockPrisma.content.findMany.mockResolvedValue([]);
      mockPrisma.escalationTicket.create.mockResolvedValue({ id: 1 });

      const result = await service.query('تخلف مالیاتی چیست');
      expect(result.source).toBe('escalated');
      expect(mockPrisma.escalationTicket.create).toHaveBeenCalled();
    });
  });

  describe('conversation management', () => {
    it('should log all messages', async () => {
      mockPrisma.chatConversation.findUnique.mockResolvedValue({
        id: 1,
        sessionId: 'test',
      });
      mockPrisma.chatConversation.create.mockResolvedValue({
        id: 1,
        sessionId: 'test',
      });
      mockPrisma.knowledgeBase.findMany.mockResolvedValue([
        { question: 'سوال', answer: 'Answer' },
      ]);

      await service.query('test question');
      expect(mockPrisma.chatMessage.create).toHaveBeenCalledTimes(2);
    });

    it('should get conversation with messages', async () => {
      mockPrisma.chatConversation.findFirst.mockResolvedValue({
        id: 1,
        sessionId: 'test',
        messages: [{ role: 'user', content: 'hi' }],
      });

      const result = await service.getConversation('test', 1, 'admin');
      expect(result.messages).toHaveLength(1);
    });
  });
});
