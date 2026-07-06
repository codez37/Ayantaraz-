import { TransferCalculator } from '../compute/calculators/transfer-calculator';

describe('TransferCalculator', () => {
  let calculator: TransferCalculator;

  beforeEach(() => {
    calculator = new TransferCalculator();
  });

  it('should have type TRANSFER', () => {
    expect(calculator.type).toBe('TRANSFER');
  });

  it('canHandle returns true for TRANSFER', () => {
    expect(calculator.canHandle('TRANSFER')).toBe(true);
    expect(calculator.canHandle('SALARY')).toBe(false);
  });

  describe('calculate', () => {
    it('should calculate 5% tax on property value', async () => {
      const result = await calculator.calculate({ amount: 1000000000 });

      expect(result.taxAmount).toBe(50000000);
      expect(result.effectiveRate).toBe(5);
      expect(result.grossAmount).toBe(1000000000);
    });

    it('should return zero tax for zero amount', async () => {
      const result = await calculator.calculate({ amount: 0 });

      expect(result.taxAmount).toBe(0);
    });

    it('should throw for negative amount', async () => {
      await expect(calculator.calculate({ amount: -1000 })).rejects.toThrow(
        'Transfer amount cannot be negative',
      );
    });
  });
});
