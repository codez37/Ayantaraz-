import { Test, TestingModule } from '@nestjs/testing';
import { TaxEngineAdminController } from '../tax-engine-admin.controller';
import { PrismaService } from '../../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { TaxBook, TaxCategory, BracketType } from '@prisma/client';
import { CreateArticleDto } from '../dto/create-article.dto';
import { CreateRuleDto } from '../dto/create-rule.dto';
import { CreateBracketDto } from '../dto/create-bracket.dto';

describe('TaxEngineAdminController', () => {
  let controller: TaxEngineAdminController;
  let prisma: Record<string, Record<string, jest.Mock>>;

  const mockPrisma = {
    taxArticle: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    taxRule: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    taxBracket: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    for (const model of Object.values(mockPrisma)) {
      for (const method of Object.values(model)) {
        method.mockReset();
      }
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaxEngineAdminController],
      providers: [{ provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    controller = module.get<TaxEngineAdminController>(TaxEngineAdminController);
    prisma = module.get(PrismaService);
  });

  describe('Articles CRUD', () => {
    const mockArticle = {
      id: 1,
      articleNumber: '72',
      text: 'ماده ۷۲',
      notes: [],
      chapterTitle: 'test',
      book: TaxBook.DIRECT,
      category: TaxCategory.INHERITANCE,
      validFrom: new Date('2024-01-01'),
      validTo: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should list articles with pagination', async () => {
      prisma.taxArticle.findMany.mockResolvedValue([mockArticle]);
      prisma.taxArticle.count.mockResolvedValue(1);

      const result = await controller.listArticles(
        { page: 1, limit: 20 },
        undefined,
        undefined,
      );

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
      expect(prisma.taxArticle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 20 }),
      );
    });

    it('should filter articles by book and category', async () => {
      prisma.taxArticle.findMany.mockResolvedValue([mockArticle]);
      prisma.taxArticle.count.mockResolvedValue(1);

      await controller.listArticles(
        { page: 1, limit: 20 },
        'INHERITANCE',
        'DIRECT',
      );

      expect(prisma.taxArticle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          where: expect.objectContaining({
            category: 'INHERITANCE',
            book: 'DIRECT',
          }),
        }),
      );
    });

    it('should get article by id', async () => {
      prisma.taxArticle.findUnique.mockResolvedValue(mockArticle);

      await expect(controller.getArticle(1)).resolves.toEqual(mockArticle);

      expect(prisma.taxArticle.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw when article not found', async () => {
      prisma.taxArticle.findUnique.mockResolvedValue(null);

      await expect(controller.getArticle(999)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should create article', async () => {
      prisma.taxArticle.create.mockResolvedValue(mockArticle);

      const dto: CreateArticleDto = {
        articleNumber: '72',
        text: 'ماده ۷۲',
        notes: [],
        chapterTitle: 'test',
        book: TaxBook.DIRECT,
        category: TaxCategory.INHERITANCE,
        validFrom: '2024-01-01',
        validTo: undefined,
      };

      await expect(controller.createArticle(dto)).resolves.toEqual(mockArticle);
      expect(prisma.taxArticle.create).toHaveBeenCalled();
    });

    it('should soft-delete article', async () => {
      prisma.taxArticle.findUnique.mockResolvedValue(mockArticle);
      prisma.taxArticle.update.mockResolvedValue({
        ...mockArticle,
        validTo: new Date(),
      });

      await controller.deleteArticle(1);

      expect(prisma.taxArticle.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data: expect.objectContaining({ validTo: expect.any(Date) }),
        }),
      );
    });
  });

  describe('Rules CRUD', () => {
    const mockRule = {
      id: 1,
      type: BracketType.RENTAL,
      ruleKey: 'RENTAL_COST_DEDUCTION',
      description: 'test',
      condition: { type: 'always' },
      action: { type: 'DEDUCTION', params: { percent: 25 } },
      priority: 0,
      effectiveFrom: new Date(),
      effectiveTo: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should list rules with pagination', async () => {
      prisma.taxRule.findMany.mockResolvedValue([mockRule]);
      prisma.taxRule.count.mockResolvedValue(1);

      const result = await controller.listRules(
        { page: 1, limit: 20 },
        undefined,
      );

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('should create rule', async () => {
      prisma.taxRule.create.mockResolvedValue(mockRule);

      const dto: CreateRuleDto = {
        type: BracketType.RENTAL,
        ruleKey: 'RENTAL_COST_DEDUCTION',
        description: 'test',
        condition: { type: 'always' },
        action: { type: 'DEDUCTION', params: { percent: 25 } },
        effectiveFrom: '2024-01-01',
      };

      await expect(controller.createRule(dto)).resolves.toEqual(mockRule);
      expect(prisma.taxRule.create).toHaveBeenCalled();
    });

    it('should soft-delete rule', async () => {
      prisma.taxRule.findUnique.mockResolvedValue(mockRule);
      prisma.taxRule.update.mockResolvedValue({
        ...mockRule,
        isActive: false,
        effectiveTo: new Date(),
      });

      await controller.deleteRule(1);

      expect(prisma.taxRule.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data: expect.objectContaining({
            isActive: false,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            effectiveTo: expect.any(Date),
          }),
        }),
      );
    });
  });

  describe('Brackets CRUD', () => {
    const mockBracket = {
      id: 1,
      year: 1403,
      type: BracketType.SALARY,
      bracketOrder: 1,
      minAmount: BigInt(0),
      maxAmount: BigInt(12000000),
      rate: 0,
      description: 'test',
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should list brackets with pagination', async () => {
      prisma.taxBracket.findMany.mockResolvedValue([mockBracket]);
      prisma.taxBracket.count.mockResolvedValue(1);

      const result = await controller.listBrackets(
        { page: 1, limit: 20 },
        undefined,
        undefined,
      );

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('should filter brackets by year and type', async () => {
      prisma.taxBracket.findMany.mockResolvedValue([mockBracket]);
      prisma.taxBracket.count.mockResolvedValue(1);

      await controller.listBrackets({ page: 1, limit: 20 }, '1403', 'SALARY');

      expect(prisma.taxBracket.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          where: expect.objectContaining({ year: 1403, type: 'SALARY' }),
        }),
      );
    });

    it('should create bracket', async () => {
      prisma.taxBracket.create.mockResolvedValue(mockBracket);

      const dto: CreateBracketDto = {
        year: 1403,
        type: BracketType.SALARY,
        bracketOrder: 1,
        minAmount: 0,
        maxAmount: 12000000,
        rate: 0,
        description: 'test',
      };

      await expect(controller.createBracket(dto)).resolves.toEqual(mockBracket);
      expect(prisma.taxBracket.create).toHaveBeenCalled();
    });

    it('should update bracket', async () => {
      prisma.taxBracket.findUnique.mockResolvedValue(mockBracket);
      prisma.taxBracket.update.mockResolvedValue({ ...mockBracket, rate: 15 });

      await controller.updateBracket(1, { rate: 15 });

      expect(prisma.taxBracket.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data: expect.objectContaining({ rate: 15 }),
        }),
      );
    });
  });
});
