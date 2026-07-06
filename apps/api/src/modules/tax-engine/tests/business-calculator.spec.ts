import { BusinessCalculator } from '../compute/calculators/business-calculator';

describe('BusinessCalculator', () => {
  let calculator: BusinessCalculator;

  beforeEach(() => {
    calculator = new BusinessCalculator({} as any);
  });

  it('should have type BUSINESS', () => {
    expect(calculator.type).toBe('BUSINESS');
  });

  it('canHandle returns true for BUSINESS', () => {
    expect(calculator.canHandle('BUSINESS')).toBe(true);
    expect(calculator.canHandle('SALARY')).toBe(false);
  });

  describe('calculate', () => {
    it('should return exempt result when income is below threshold', async () => {
      const result = await calculator.calculate({ amount: 1000000 });

      expect(result.type).toBe('BUSINESS');
      expect(result.details!.isExempt).toBe(true);
      expect(result.details!.message).toBeTruthy();
      expect(result.taxAmount).toBe(0);
    });
  });
});
