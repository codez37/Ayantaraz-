import { seedTaxEngine } from '../seed/tax-engine.seed';

describe('seedTaxEngine', () => {
  let prisma: {
    taxBracket: { upsert: jest.Mock };
    taxRule: { upsert: jest.Mock };
  };

  beforeEach(() => {
    prisma = {
      taxBracket: { upsert: jest.fn().mockResolvedValue({}) },
      taxRule: { upsert: jest.fn().mockResolvedValue({}) },
    };
  });

  it('should seed 8 tax brackets (6 salary + 1 rental + 1 corporate)', async () => {
    await seedTaxEngine(prisma);

    expect(prisma.taxBracket.upsert).toHaveBeenCalledTimes(8);
  });

  it('should upsert salary bracket 1 with correct data', async () => {
    await seedTaxEngine(prisma);

    expect(prisma.taxBracket.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          year_type_bracketOrder: {
            year: 1403,
            type: 'SALARY',
            bracketOrder: 1,
          },
        },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        create: expect.objectContaining({
          minAmount: BigInt(0),
          maxAmount: BigInt(12000000),
          rate: 0,
          description: 'معافیت پایه حقوق ماهانه ۱۴۰۳',
        }),
      }),
    );
  });

  it('should seed rental bracket with 25% rate', async () => {
    await seedTaxEngine(prisma);

    expect(prisma.taxBracket.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          year_type_bracketOrder: {
            year: 1403,
            type: 'RENTAL',
            bracketOrder: 1,
          },
        },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        create: expect.objectContaining({ rate: 25, maxAmount: null }),
      }),
    );
  });

  it('should seed corporate bracket with 25% rate', async () => {
    await seedTaxEngine(prisma);

    expect(prisma.taxBracket.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          year_type_bracketOrder: {
            year: 1403,
            type: 'CORPORATE',
            bracketOrder: 1,
          },
        },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        create: expect.objectContaining({ rate: 25, maxAmount: null }),
      }),
    );
  });

  it('should seed 5 tax rules', async () => {
    await seedTaxEngine(prisma);

    expect(prisma.taxRule.upsert).toHaveBeenCalledTimes(5);
  });

  it('should upsert RENTAL_COST_DEDUCTION rule', async () => {
    await seedTaxEngine(prisma);

    expect(prisma.taxRule.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { ruleKey: 'RENTAL_COST_DEDUCTION' },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        create: expect.objectContaining({
          ruleKey: 'RENTAL_COST_DEDUCTION',
          type: 'RENTAL',
        }),
      }),
    );
  });

  it('should upsert TRANSFER_PROPERTY_RATE rule', async () => {
    await seedTaxEngine(prisma);

    expect(prisma.taxRule.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { ruleKey: 'TRANSFER_PROPERTY_RATE' },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        create: expect.objectContaining({
          ruleKey: 'TRANSFER_PROPERTY_RATE',
          type: 'TRANSFER',
        }),
      }),
    );
  });
});
