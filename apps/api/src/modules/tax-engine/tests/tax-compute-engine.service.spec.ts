import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { TaxComputeEngineService } from '../compute/tax-compute-engine.service';
import { ITaxCalculator } from '../compute/interfaces/tax-calculator.interface';

describe('TaxComputeEngineService', () => {
  let engine: TaxComputeEngineService;

  const mockPrisma = {
    taxBracket: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaxComputeEngineService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    engine = module.get<TaxComputeEngineService>(TaxComputeEngineService);
  });

  it('should be defined', () => {
    expect(engine).toBeDefined();
  });

  describe('registerCalculator', () => {
    it('should register a custom calculator', () => {
      const mockCalc: ITaxCalculator = {
        type: 'CUSTOM',
        canHandle: jest.fn().mockReturnValue(true),
        calculate: jest.fn().mockResolvedValue({
          type: 'CUSTOM',
          grossAmount: 100,
          taxableAmount: 100,
          taxAmount: 10,
          effectiveRate: 10,
        }),
      };

      engine.registerCalculator(mockCalc);

      expect(mockCalc.canHandle).not.toHaveBeenCalled();
    });
  });

  describe('calculate', () => {
    it('should find calculator by type key', async () => {
      mockPrisma.taxBracket.findMany.mockResolvedValue([]);

      const result = await engine.calculate('SALARY', {
        amount: 0,
        year: 1403,
      });

      expect(result.type).toBe('SALARY');
    });

    it('should find calculator via canHandle fallback', async () => {
      const mockCalc: ITaxCalculator = {
        type: 'FALLBACK_CALC',
        canHandle: jest.fn().mockReturnValue(true),
        calculate: jest.fn().mockResolvedValue({
          type: 'FALLBACK_CALC',
          grossAmount: 0,
          taxableAmount: 0,
          taxAmount: 0,
          effectiveRate: 0,
        }),
      };

      engine.registerCalculator(mockCalc);

      const result = await engine.calculate('WHATEVER', {});

      expect(result.type).toBe('FALLBACK_CALC');
    });

    it('should throw NotFoundException for unknown type', async () => {
      await expect(engine.calculate('UNKNOWN_TYPE', {})).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return CALC result for RENTAL', async () => {
      mockPrisma.taxBracket.findFirst.mockResolvedValue(null);

      const result = await engine.calculate('RENTAL', {
        amount: 10000000,
        isResidential: false,
      });

      expect(result.type).toBe('RENTAL');
      expect(result.taxAmount).toBeGreaterThan(0);
    });

    it('should return CALC result for INHERITANCE', async () => {
      const result = await engine.calculate('INHERITANCE', {
        assets: [{ type: 'BANK_DEPOSIT', value: 100000000 }],
        heirClass: 1,
      });

      expect(result.type).toBe('INHERITANCE');
      expect(result.taxAmount).toBeGreaterThan(0);
    });

    it('should return CALC result for TRANSFER', async () => {
      const result = await engine.calculate('TRANSFER', { amount: 100000000 });

      expect(result.type).toBe('TRANSFER');
      expect(result.taxAmount).toBe(5000000);
    });

    it('should return CALC result for BUSINESS', async () => {
      const result = await engine.calculate('BUSINESS', {
        amount: 50000000000,
        year: 1404,
        businessType: 'عمده فروشی',
      });

      expect(result.type).toBe('BUSINESS');
      expect(result.details).toBeDefined();
      expect(result.details!.article).toBe('131');
    });

    it('should return CALC result for CORPORATE', async () => {
      const result = await engine.calculate('CORPORATE', {
        netProfit: 100000000,
      });

      expect(result.type).toBe('CORPORATE');
      expect(result.taxAmount).toBe(25000000);
    });
  });
});
