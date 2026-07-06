import { CorporateCalculator } from '../compute/calculators/corporate-calculator';

describe('CorporateCalculator', () => {
  let calculator: CorporateCalculator;

  beforeEach(() => {
    calculator = new CorporateCalculator();
  });

  it('should have type CORPORATE', () => {
    expect(calculator.type).toBe('CORPORATE');
  });

  it('canHandle returns true for CORPORATE', () => {
    expect(calculator.canHandle('CORPORATE')).toBe(true);
    expect(calculator.canHandle('SALARY')).toBe(false);
  });

  describe('calculate', () => {
    it('should calculate 25% tax on net profit', async () => {
      const result = await calculator.calculate({ netProfit: 100000000 });

      expect(result.taxAmount).toBe(25000000);
      expect(result.effectiveRate).toBe(25);
      expect(result.grossAmount).toBe(100000000);
    });

    it('should return zero tax for zero profit', async () => {
      const result = await calculator.calculate({ netProfit: 0 });

      expect(result.taxAmount).toBe(0);
    });

    it('should throw for negative profit', async () => {
      await expect(calculator.calculate({ netProfit: -1000 })).rejects.toThrow(
        'Net profit cannot be negative',
      );
    });
  });
});
