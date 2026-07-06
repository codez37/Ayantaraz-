import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../prisma/prisma.service';
import { RentalCalculator } from '../compute/calculators/rental-calculator';

describe('RentalCalculator', () => {
  let calculator: RentalCalculator;

  const mockPrisma = {
    taxBracket: {
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RentalCalculator,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    calculator = module.get<RentalCalculator>(RentalCalculator);
  });

  it('should have type RENTAL', () => {
    expect(calculator.type).toBe('RENTAL');
  });

  it('canHandle returns true for RENTAL', () => {
    expect(calculator.canHandle('RENTAL')).toBe(true);
    expect(calculator.canHandle('SALARY')).toBe(false);
  });

  describe('calculate', () => {
    it('should calculate tax for residential property with default rate', async () => {
      mockPrisma.taxBracket.findFirst.mockResolvedValue(null);

      const result = await calculator.calculate({
        amount: 10000000,
        isResidential: true,
        year: 1403,
      });

      expect(result.grossAmount).toBe(10000000);
      // expenseDeduction=2,500,000, taxableRent=7,500,000
      // residentialDiscount=3,000,000, taxableRent=4,500,000
      // taxRate=25%, totalTax=4,500,000*0.25=1,125,000
      expect(result.taxAmount).toBe(1125000);
      expect(result.details!.expenseDeduction).toBe(2500000);
      expect(result.details!.residentialDiscount).toBe(3000000);
      expect(result.details!.isResidential).toBe(true);
    });

    it('should calculate tax for commercial property', async () => {
      mockPrisma.taxBracket.findFirst.mockResolvedValue(null);

      const result = await calculator.calculate({
        amount: 10000000,
        isResidential: false,
        year: 1403,
      });

      expect(result.taxAmount).toBe(1875000); // 7,500,000 * 25%
      expect(result.details!.residentialDiscount).toBe(0);
      expect(result.details!.isResidential).toBe(false);
    });

    it('should use bracket rate when available', async () => {
      mockPrisma.taxBracket.findFirst.mockResolvedValue({
        id: 1,
        year: 1403,
        type: 'RENTAL',
        bracketOrder: 1,
        minAmount: BigInt(0),
        maxAmount: null,
        rate: 30,
        description: 'نرخ اجاره',
        metadata: {},
      });

      const result = await calculator.calculate({
        amount: 10000000,
        isResidential: true,
        year: 1403,
      });

      expect(result.details!.taxRate).toBe(30);
    });

    it('should throw for negative amount', async () => {
      await expect(
        calculator.calculate({ amount: -1000, isResidential: false }),
      ).rejects.toThrow('Rental amount cannot be negative');
    });
  });
});
