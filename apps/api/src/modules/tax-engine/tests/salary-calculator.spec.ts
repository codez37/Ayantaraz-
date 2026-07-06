import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../prisma/prisma.service';
import { SalaryCalculator } from '../compute/calculators/salary-calculator';

describe('SalaryCalculator', () => {
  let calculator: SalaryCalculator;

  const mockBrackets1403 = [
    {
      id: 1,
      year: 1403,
      type: 'SALARY',
      bracketOrder: 1,
      minAmount: BigInt(0),
      maxAmount: BigInt(12000000),
      rate: 0,
      description: 'معافیت پایه',
      metadata: {},
    },
    {
      id: 2,
      year: 1403,
      type: 'SALARY',
      bracketOrder: 2,
      minAmount: BigInt(12000001),
      maxAmount: BigInt(30000000),
      rate: 10,
      description: 'نرخ ۱۰٪',
      metadata: {},
    },
    {
      id: 3,
      year: 1403,
      type: 'SALARY',
      bracketOrder: 3,
      minAmount: BigInt(30000001),
      maxAmount: BigInt(60000000),
      rate: 15,
      description: 'نرخ ۱۵٪',
      metadata: {},
    },
    {
      id: 4,
      year: 1403,
      type: 'SALARY',
      bracketOrder: 4,
      minAmount: BigInt(60000001),
      maxAmount: BigInt(120000000),
      rate: 20,
      description: 'نرخ ۲۰٪',
      metadata: {},
    },
    {
      id: 5,
      year: 1403,
      type: 'SALARY',
      bracketOrder: 5,
      minAmount: BigInt(120000001),
      maxAmount: BigInt(200000000),
      rate: 25,
      description: 'نرخ ۲۵٪',
      metadata: {},
    },
    {
      id: 6,
      year: 1403,
      type: 'SALARY',
      bracketOrder: 6,
      minAmount: BigInt(200000001),
      maxAmount: null,
      rate: 30,
      description: 'نرخ ۳۰٪',
      metadata: {},
    },
  ];

  const mockPrisma = {
    taxBracket: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalaryCalculator,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    calculator = module.get<SalaryCalculator>(SalaryCalculator);
  });

  it('should have type SALARY', () => {
    expect(calculator.type).toBe('SALARY');
  });

  it('canHandle returns true for SALARY', () => {
    expect(calculator.canHandle('SALARY')).toBe(true);
    expect(calculator.canHandle('RENTAL')).toBe(false);
  });

  describe('calculate', () => {
    it('should return zero tax for salary below exemption', async () => {
      mockPrisma.taxBracket.findMany.mockResolvedValue(mockBrackets1403);

      const result = await calculator.calculate({
        amount: 8000000,
        year: 1403,
      });

      expect(result.grossAmount).toBe(8000000);
      expect(result.exemptionAmount).toBe(8000000);
      expect(result.taxableAmount).toBe(0);
      expect(result.taxAmount).toBe(0);
      expect(result.annualTaxAmount).toBe(0);
      expect(result.effectiveRate).toBe(0);
    });

    it('should calculate tax for salary spanning first taxable bracket', async () => {
      mockPrisma.taxBracket.findMany.mockResolvedValue(mockBrackets1403);

      const result = await calculator.calculate({
        amount: 15000000,
        year: 1403,
      });

      expect(result.grossAmount).toBe(15000000);
      expect(result.exemptionAmount).toBe(12000000);
      expect(result.taxableAmount).toBe(3000000);
      expect(result.taxAmount).toBe(300000);
      expect(result.annualTaxAmount).toBe(3600000);
      expect(result.effectiveRate).toBe(2);
    });

    it('should calculate tax across multiple brackets', async () => {
      mockPrisma.taxBracket.findMany.mockResolvedValue(mockBrackets1403);

      const result = await calculator.calculate({
        amount: 50000000,
        year: 1403,
      });

      expect(result.grossAmount).toBe(50000000);
      expect(result.taxAmount).toBeGreaterThan(0);
      expect(result.breakdown).toHaveLength(3);
    });

    it('should handle salary in highest bracket', async () => {
      mockPrisma.taxBracket.findMany.mockResolvedValue(mockBrackets1403);

      const result = await calculator.calculate({
        amount: 250000000,
        year: 1403,
      });

      expect(result.grossAmount).toBe(250000000);
      expect(result.breakdown).toHaveLength(6);
      expect(result.taxAmount).toBeGreaterThan(0);
    });

    it('should default to year 1403 when not provided', async () => {
      mockPrisma.taxBracket.findMany.mockResolvedValue(mockBrackets1403);

      const result = await calculator.calculate({ amount: 15000000 });

      expect(result.taxAmount).toBe(300000);
      expect(mockPrisma.taxBracket.findMany).toHaveBeenCalled();
    });

    it('should throw for negative salary', async () => {
      await expect(
        calculator.calculate({ amount: -1000, year: 1403 }),
      ).rejects.toThrow('Salary amount cannot be negative');
    });

    it('should handle salary of 0', async () => {
      mockPrisma.taxBracket.findMany.mockResolvedValue(mockBrackets1403);

      const result = await calculator.calculate({ amount: 0, year: 1403 });

      expect(result.taxAmount).toBe(0);
      expect(result.effectiveRate).toBe(0);
    });
  });
});
