import { InheritanceCalculator } from '../compute/calculators/inheritance-calculator';

describe('InheritanceCalculator', () => {
  let calculator: InheritanceCalculator;

  beforeEach(() => {
    calculator = new InheritanceCalculator();
  });

  it('should have type INHERITANCE', () => {
    expect(calculator.type).toBe('INHERITANCE');
  });

  it('canHandle returns true for INHERITANCE', () => {
    expect(calculator.canHandle('INHERITANCE')).toBe(true);
    expect(calculator.canHandle('SALARY')).toBe(false);
  });

  describe('calculate', () => {
    it('should calculate inheritance tax for heir class 1', async () => {
      const result = await calculator.calculate({
        assets: [
          { type: 'BANK_DEPOSIT', value: 100000000 },
          { type: 'PROPERTY', value: 500000000 },
        ],
        heirClass: 1,
      });

      expect(result.grossAmount).toBe(600000000);
      expect(result.taxAmount).toBe(28000000);
      // BANK_DEPOSIT: 3% * 1 * 100M = 3,000,000
      // PROPERTY: 5% * 1 * 500M = 25,000,000
      // Total: 28,000,000
      expect(result.details!.items).toHaveLength(2);
      expect(result.details!.multiplier).toBe(1);
    });

    it('should apply 2x multiplier for heir class 2', async () => {
      const result = await calculator.calculate({
        assets: [{ type: 'BANK_DEPOSIT', value: 100000000 }],
        heirClass: 2,
      });

      expect(result.taxAmount).toBe(6000000); // 3% * 2 * 100M = 6,000,000
      expect(result.details!.multiplier).toBe(2);
    });

    it('should apply 4x multiplier for heir class 3', async () => {
      const result = await calculator.calculate({
        assets: [{ type: 'BANK_DEPOSIT', value: 100000000 }],
        heirClass: 3,
      });

      expect(result.taxAmount).toBe(12000000); // 3% * 4 * 100M = 12,000,000
      expect(result.details!.multiplier).toBe(4);
    });

    it('should use OTHER base rate for unknown asset types', async () => {
      const result = await calculator.calculate({
        assets: [{ type: 'CRYPTOCURRENCY', value: 50000000 }],
        heirClass: 1,
      });

      expect(result.taxAmount).toBe(1500000); // 3% (OTHER) * 1 * 50M = 1,500,000
    });

    it('should throw for empty assets', async () => {
      await expect(
        calculator.calculate({ assets: [], heirClass: 1 }),
      ).rejects.toThrow('Assets array is required and must not be empty');
    });

    it('should throw for invalid heir class', async () => {
      await expect(
        calculator.calculate({
          assets: [{ type: 'BANK_DEPOSIT', value: 100000 }],
          heirClass: 4,
        }),
      ).rejects.toThrow('heirClass must be 1, 2, or 3');
    });
  });
});
