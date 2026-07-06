import { Test, TestingModule } from '@nestjs/testing';
import { TaxEngineService } from '../tax-engine.service';
import { QueryRouterService } from '../router/query-router.service';
import { PersianSearchEngineService } from '../search/persian-search-engine.service';
import { TaxComputeEngineService } from '../compute/tax-compute-engine.service';
import { StateManagerService } from '../session/state-manager.service';
import { ResponseFormatterService } from '../response/response-formatter.service';
import { ConfidenceEngineService } from '../confidence/confidence-engine.service';
import { TaxSessionStep } from '../session/session-state.enum';
import { SearchResult } from '../interfaces/search-result.interface';
import { CalcResult } from '../interfaces/calc-result.interface';

describe('TaxEngineService', () => {
  let service: TaxEngineService;
  let queryRouter: { detect: jest.Mock };
  let searchEngine: { search: jest.Mock; getArticleById: jest.Mock };
  let computeEngine: { calculate: jest.Mock };
  let stateManager: {
    getOrCreateSession: jest.Mock;
    addHistory: jest.Mock;
    updateStep: jest.Mock;
    updateSession: jest.Mock;
    createSession: jest.Mock;
    resetSession: jest.Mock;
    getSession: jest.Mock;
    cleanupExpiredSessions: jest.Mock;
  };
  let formatter: {
    formatSearch: jest.Mock;
    formatCalc: jest.Mock;
    formatProcedure: jest.Mock;
    formatUnknown: jest.Mock;
    formatArticleDetail: jest.Mock;
    formatPersianNumber: jest.Mock;
  };
  let confidenceEngine: { evaluate: jest.Mock };

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
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresAt: new Date(Date.now() + 30 * 60 * 1000),
  };

  beforeEach(async () => {
    queryRouter = { detect: jest.fn() };
    searchEngine = { search: jest.fn(), getArticleById: jest.fn() };
    computeEngine = { calculate: jest.fn() };
    stateManager = {
      getOrCreateSession: jest.fn(),
      addHistory: jest.fn(),
      updateStep: jest.fn(),
      updateSession: jest.fn(),
      createSession: jest.fn(),
      resetSession: jest.fn(),
      getSession: jest.fn(),
      cleanupExpiredSessions: jest.fn(),
    };
    formatter = {
      formatSearch: jest.fn(),
      formatCalc: jest.fn(),
      formatProcedure: jest.fn(),
      formatUnknown: jest.fn(),
      formatArticleDetail: jest.fn(),
      formatPersianNumber: jest.fn(),
    };
    confidenceEngine = {
      evaluate: jest.fn().mockReturnValue({
        score: 80,
        calcType: 'SALARY',
        isConfident: true,
        entities: { amount: 15000000, year: 1403 },
        filledSlots: [],
        missingSlots: [],
        clarificationPrompt: null,
        explainability: {
          detectedIntent: 'test',
          confidencePercent: 80,
          extractedEntities: {},
          assumptions: [],
        },
        version: 'v1.0.0',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaxEngineService,
        { provide: QueryRouterService, useValue: queryRouter },
        { provide: PersianSearchEngineService, useValue: searchEngine },
        { provide: TaxComputeEngineService, useValue: computeEngine },
        { provide: StateManagerService, useValue: stateManager },
        { provide: ResponseFormatterService, useValue: formatter },
        { provide: ConfidenceEngineService, useValue: confidenceEngine },
      ],
    }).compile();

    service = module.get<TaxEngineService>(TaxEngineService);
  });

  describe('processQuery', () => {
    it('should route SEARCH and return formatted result', async () => {
      stateManager.getOrCreateSession.mockResolvedValue({
        session: mockSession,
        isNew: false,
      });
      queryRouter.detect.mockReturnValue('SEARCH');

      const mockResults: SearchResult[] = [
        {
          articleNumber: '71',
          title: 'ماده ۷۱',
          text: 'ماده ۷۱ متن',
          notes: [],
          score: 10,
          book: 'DIRECT',
        },
      ];
      searchEngine.search.mockResolvedValue(mockResults);
      formatter.formatSearch.mockReturnValue(
        '## جستجوی مواد قانونی\n\nماده ۷۱',
      );
      stateManager.updateStep.mockResolvedValue(mockSession);

      const result = await service.processQuery(
        'test-session-id',
        'ماده ۷۱ چه می‌گوید؟',
      );

      expect(result.type).toBe('SEARCH');
      expect(result.sessionId).toBe('test-session-id');
      expect(result.answer).toContain('ماده ۷۱');
      expect(result.results).toHaveLength(1);
      expect(stateManager.addHistory).toHaveBeenCalled();
    });

    it('should route CALC and return computed result', async () => {
      stateManager.getOrCreateSession.mockResolvedValue({
        session: mockSession,
        isNew: false,
      });
      queryRouter.detect.mockReturnValue('CALC');

      const mockCalcResult: CalcResult = {
        type: 'SALARY',
        grossAmount: 15000000,
        exemptionAmount: 12000000,
        taxableAmount: 3000000,
        taxAmount: 300000,
        annualTaxAmount: 3600000,
        effectiveRate: 2,
      };
      computeEngine.calculate.mockResolvedValue(mockCalcResult);
      formatter.formatCalc.mockReturnValue(
        '## محاسبه مالیات بر حقوق\n\n**مالیات:** ۳۰۰,۰۰۰',
      );
      stateManager.updateStep.mockResolvedValue(mockSession);

      const result = await service.processQuery(
        'test-session-id',
        'مالیات حقوق ۱۵ میلیون',
      );

      expect(result.type).toBe('CALC');
      expect(result.sessionId).toBe('test-session-id');
      expect(result.computation).toBeDefined();
      expect(result.computation!.type).toBe('SALARY');
    });

    it('should route PROCEDURE and return procedure result', async () => {
      stateManager.getOrCreateSession.mockResolvedValue({
        session: mockSession,
        isNew: false,
      });
      queryRouter.detect.mockReturnValue('PROCEDURE');

      const mockResults: SearchResult[] = [];
      searchEngine.search.mockResolvedValue(mockResults);
      formatter.formatSearch.mockReturnValue('## جستجو');
      stateManager.updateStep.mockResolvedValue(mockSession);

      const result = await service.processQuery(
        'test-session-id',
        'مراحل اعتراض',
      );

      expect(result.type).toBe('PROCEDURE');
      expect(result.sessionId).toBe('test-session-id');
    });

    it('should route UNKNOWN for unrecognized queries', async () => {
      stateManager.getOrCreateSession.mockResolvedValue({
        session: mockSession,
        isNew: false,
      });
      queryRouter.detect.mockReturnValue('UNKNOWN');
      formatter.formatUnknown.mockReturnValue('متوجه نوع سوال شما نشدم');
      stateManager.updateStep.mockResolvedValue(mockSession);

      const result = await service.processQuery('test-session-id', 'سلام');

      expect(result.type).toBe('UNKNOWN');
      expect(result.answer).toContain('متوجه');
    });

    it('should create new session when no sessionId', async () => {
      stateManager.getOrCreateSession.mockResolvedValue({
        session: { ...mockSession, id: 'new-session-id' },
        isNew: true,
      });
      queryRouter.detect.mockReturnValue('UNKNOWN');
      formatter.formatUnknown.mockReturnValue('متوجه');
      stateManager.updateStep.mockResolvedValue(mockSession);

      const result = await service.processQuery(undefined, 'سلام');

      expect(result.sessionId).toBe('new-session-id');
      expect(stateManager.getOrCreateSession).toHaveBeenCalledWith(undefined);
    });

    it('should reuse existing session', async () => {
      stateManager.getOrCreateSession.mockResolvedValue({
        session: mockSession,
        isNew: false,
      });
      queryRouter.detect.mockReturnValue('UNKNOWN');
      formatter.formatUnknown.mockReturnValue('متوجه');
      stateManager.updateStep.mockResolvedValue(mockSession);

      const result = await service.processQuery('test-session-id', 'سلام');

      expect(result.sessionId).toBe('test-session-id');
      expect(stateManager.getOrCreateSession).toHaveBeenCalledWith(
        'test-session-id',
      );
    });

    it('should propagate DB connection failure (not swallow)', async () => {
      stateManager.getOrCreateSession.mockRejectedValue(new Error('DB error'));

      await expect(
        service.processQuery('test-session-id', 'سلام'),
      ).rejects.toThrow('DB error');
    });

    it('should propagate session creation failure (not swallow)', async () => {
      stateManager.getOrCreateSession.mockRejectedValue(
        new Error('Connection refused'),
      );

      await expect(
        service.processQuery(undefined, 'محاسبه مالیات'),
      ).rejects.toThrow('Connection refused');
    });

    it('should propagate search engine failure (not swallow)', async () => {
      stateManager.getOrCreateSession.mockResolvedValue({
        session: mockSession,
        isNew: false,
      });
      queryRouter.detect.mockReturnValue('SEARCH');
      searchEngine.search.mockRejectedValue(new Error('Index corrupted'));

      await expect(
        service.processQuery('s1', 'قوانین مالیاتی'),
      ).rejects.toThrow('Index corrupted');
    });

    it('should recover from history write failure (not crash)', async () => {
      stateManager.getOrCreateSession.mockResolvedValue({
        session: mockSession,
        isNew: false,
      });
      queryRouter.detect.mockReturnValue('UNKNOWN');
      formatter.formatUnknown.mockReturnValue('متوجه');
      // First addHistory (user message) succeeds, second (assistant) fails
      stateManager.addHistory
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('Write failed'));

      const result = await service.processQuery('s1', 'سلام');

      expect(result.type).toBe('UNKNOWN');
      expect(result.sessionId).toBe(mockSession.id);
    });
  });

  describe('extractAmount', () => {
    it('should extract Persian numbers from text', () => {
      expect(service.extractAmount('۱۵ میلیون')).toBe(15000000);
    });

    it('should handle multipliers like هزار and میلیون', () => {
      expect(service.extractAmount('۵ هزار')).toBe(5000);
      expect(service.extractAmount('۲ میلیارد')).toBe(2000000000);
    });

    it('should return null for text without numbers', () => {
      expect(service.extractAmount('سلام')).toBeNull();
    });

    it('should handle Latin digits', () => {
      expect(service.extractAmount('10 میلیون')).toBe(10000000);
    });
  });

  describe('detectCalcType', () => {
    it('should detect SALARY from حقوق keyword', () => {
      expect(service.detectCalcType('مالیات حقوق ۱۵ میلیون')).toBe('SALARY');
    });

    it('should detect RENTAL from اجاره keyword', () => {
      expect(service.detectCalcType('مالیات اجاره ۱۰ میلیون')).toBe('RENTAL');
    });

    it('should detect INHERITANCE from ارث keyword', () => {
      expect(service.detectCalcType('مالیات بر ارث')).toBe('INHERITANCE');
    });

    it('should default to SALARY when no type keyword found', () => {
      expect(service.detectCalcType('محاسبه کن')).toBe('SALARY');
    });
  });
});
