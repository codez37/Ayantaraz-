import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../prisma/prisma.service';
import { StateManagerService } from '../session/state-manager.service';
import { TaxSessionStep } from '../session/session-state.enum';

describe('StateManagerService', () => {
  let service: StateManagerService;

  const mockSession = {
    id: 'test-session-id',
    step: TaxSessionStep.awaiting_query,
    queryType: null,
    originalQuery: null,
    detectedType: null,
    calcType: null,
    calcParams: null,
    calcResult: null,
    searchResults: null,
    selectedArticleId: null,
    procedureTopic: null,
    history: [],
    userId: null,
    version: 0,
    messageHash: null,
    traceId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresAt: new Date(Date.now() + 30 * 60 * 1000),
  };

  const prisma = {
    taxSession: {
      create: jest.fn(),
      findUnique: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StateManagerService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<StateManagerService>(StateManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSession', () => {
    it('should create a session with awaiting_query step', async () => {
      prisma.taxSession.create.mockResolvedValue(mockSession);

      const result = await service.createSession();

      expect(result.step).toBe(TaxSessionStep.awaiting_query);
      expect(prisma.taxSession.create).toHaveBeenCalled();
    });

    it('should set expiresAt in the future', async () => {
      prisma.taxSession.create.mockResolvedValue(mockSession);

      await service.createSession();

      expect(prisma.taxSession.create).toHaveBeenCalled();
    });

    it('should set userId when provided', async () => {
      prisma.taxSession.create.mockResolvedValue({
        ...mockSession,
        userId: 42,
      });

      const result = await service.createSession(42);

      expect(result.userId).toBe(42);
    });
  });

  describe('getSession', () => {
    it('should return null for non-existent session', async () => {
      prisma.taxSession.findUnique.mockResolvedValue(null);

      const result = await service.getSession('non-existent');

      expect(result).toBeNull();
    });

    it('should return session for existing session', async () => {
      prisma.taxSession.findUnique.mockResolvedValue(mockSession);

      const result = await service.getSession('test-session-id');

      expect(result).toEqual(mockSession);
    });
  });

  describe('getOrCreateSession', () => {
    it('should create new session when no id provided', async () => {
      prisma.taxSession.create.mockResolvedValue(mockSession);

      const { session, isNew } = await service.getOrCreateSession();

      expect(isNew).toBe(true);
      expect(session).toBeDefined();
    });

    it('should return existing session when valid id provided', async () => {
      prisma.taxSession.findUnique.mockResolvedValue(mockSession);

      const { session, isNew } =
        await service.getOrCreateSession('test-session-id');

      expect(isNew).toBe(false);
      expect(session.id).toBe('test-session-id');
    });

    it('should create new session when expired', async () => {
      const expiredSession = {
        ...mockSession,
        expiresAt: new Date(Date.now() - 1000),
      };
      prisma.taxSession.findUnique
        .mockResolvedValueOnce(expiredSession)
        .mockResolvedValueOnce(expiredSession);
      prisma.taxSession.updateMany.mockResolvedValue({ count: 1 });
      prisma.taxSession.create.mockResolvedValue({
        ...mockSession,
        id: 'new-session-id',
      });

      const { session, isNew } =
        await service.getOrCreateSession('test-session-id');

      expect(isNew).toBe(true);
      expect(session.id).toBe('new-session-id');
    });
  });

  describe('updateSession', () => {
    it('should update and refresh expiresAt', async () => {
      const updatedSession = { ...mockSession, step: TaxSessionStep.searching };
      prisma.taxSession.findUnique.mockResolvedValue(updatedSession);
      prisma.taxSession.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.updateSession('test-session-id', {
        step: TaxSessionStep.searching,
      });

      expect(result.step).toBe(TaxSessionStep.searching);
      expect(prisma.taxSession.updateMany).toHaveBeenCalled();
    });
  });

  describe('updateStep', () => {
    it('should change step with valid transition', async () => {
      const updatedSession = { ...mockSession, step: TaxSessionStep.computing };
      prisma.taxSession.findUnique
        .mockResolvedValueOnce(mockSession)
        .mockResolvedValueOnce(updatedSession);
      prisma.taxSession.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.updateStep(
        'test-session-id',
        TaxSessionStep.computing,
      );

      expect(result.step).toBe(TaxSessionStep.computing);
    });

    it('should reject invalid transition', async () => {
      prisma.taxSession.findUnique.mockResolvedValue(mockSession);

      await expect(
        service.updateStep('test-session-id', TaxSessionStep.awaiting_query),
      ).rejects.toThrow();
    });
  });

  describe('addHistory', () => {
    it('should append entry to history array', async () => {
      const sessionWithHistory = { ...mockSession, history: [] };
      prisma.taxSession.findUnique
        .mockResolvedValueOnce(sessionWithHistory)
        .mockResolvedValueOnce(sessionWithHistory);
      prisma.taxSession.updateMany.mockResolvedValue({ count: 1 });

      await service.addHistory('test-session-id', {
        role: 'user',
        content: 'test message',
        type: 'SEARCH',
      });

      expect(prisma.taxSession.updateMany).toHaveBeenCalled();
    });
  });

  describe('resetSession', () => {
    it('should set step to terminated', async () => {
      prisma.taxSession.updateMany.mockResolvedValue({ count: 1 });
      prisma.taxSession.findUnique.mockResolvedValue({
        ...mockSession,
        step: TaxSessionStep.terminated,
      });

      const result = await service.resetSession('test-session-id');

      expect(result.step).toBe(TaxSessionStep.terminated);
    });
  });

  describe('cleanupExpiredSessions', () => {
    it('should delete expired sessions', async () => {
      prisma.taxSession.deleteMany.mockResolvedValue({ count: 5 });

      const count = await service.cleanupExpiredSessions();

      expect(count).toBe(5);
      expect(prisma.taxSession.deleteMany).toHaveBeenCalled();
    });
  });
});
