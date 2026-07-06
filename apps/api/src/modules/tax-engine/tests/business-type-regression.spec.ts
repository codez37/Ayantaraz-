import { EntityExtractorService } from '../confidence/entity-extractor.service';
import { normalizeBusinessType } from '../confidence/business-dictionary';

describe('Business Type Detection - Regression Tests', () => {
  let extractor: EntityExtractorService;

  beforeEach(() => {
    extractor = new EntityExtractorService();
  });

  describe('Regression: "عمده فروشی لوازم ساختمانی"', () => {
    it('should detect as wholesale building materials', () => {
      const result = normalizeBusinessType('عمده فروشی لوازم ساختمانی');
      expect(result).not.toBeNull();
      expect(result!.canonical).toBe('عمده فروشی لوازم ساختمانی');
      expect(result!.coefficient).toBe(0.028);
    });

    it('should detect via entity extractor', () => {
      const entities = extractor.extract('عمده فروشی لوازم ساختمانی');
      expect(entities.businessType).toBe('عمده فروشی لوازم ساختمانی');
    });
  });

  describe('Regression: "عمده فروشی لوازم بهداشتی ساختمانی"', () => {
    it('should detect as building sanitary (ساختمانی wins over بهداشتی)', () => {
      const result = normalizeBusinessType('عمده فروشی لوازم بهداشتی ساختمانی');
      expect(result).not.toBeNull();
      // ساختمانی should match first due to dictionary ordering
      expect(result!.canonical).toBe('عمده فروشی لوازم ساختمانی');
      expect(result!.coefficient).toBe(0.028);
    });

    it('should NOT return health equipment coefficient', () => {
      const result = normalizeBusinessType('عمده فروشی لوازم بهداشتی ساختمانی');
      expect(result!.coefficient).not.toBe(0.03);
    });
  });

  describe('Regression: "فروشگاه لوازم بهداشتی"', () => {
    it('should detect as retail hygiene', () => {
      const result = normalizeBusinessType('فروشگاه لوازم بهداشتی');
      expect(result).not.toBeNull();
      expect(result!.canonical).toBe('خرده فروشی لوازم بهداشتی');
      expect(result!.coefficient).toBe(0.04);
    });

    it('should detect via entity extractor', () => {
      const entities = extractor.extract('فروشگاه لوازم بهداشتی');
      expect(entities.businessType).toBe('خرده فروشی لوازم بهداشتی');
    });
  });

  describe('Regression: "پیمانکار ساختمانی"', () => {
    it('should detect as construction services', () => {
      const result = normalizeBusinessType('پیمانکار ساختمانی');
      expect(result).not.toBeNull();
      // Should match a service category
      expect(result!.category).toBe('service');
    });

    it('should detect via entity extractor', () => {
      const entities = extractor.extract('پیمانکار ساخтомانی');
      expect(entities.businessType).toBeTruthy();
    });
  });

  describe('Edge cases', () => {
    it('should handle empty string', () => {
      const result = normalizeBusinessType('');
      expect(result).toBeNull();
    });

    it('should handle random text', () => {
      const result = normalizeBusinessType('سلام دنیا');
      expect(result).toBeNull();
    });

    it('should handle partial match "شیرآلات"', () => {
      const result = normalizeBusinessType('شیرآلات');
      expect(result).not.toBeNull();
      expect(result!.canonical).toBe('عمده فروشی لوازم ساختمانی');
    });

    it('should handle partial match "آهن"', () => {
      const result = normalizeBusinessType('آهن');
      expect(result).not.toBeNull();
      expect(result!.canonical).toBe('عمده فروشی آهن آلات');
    });

    it('should handle partial match "رستوران"', () => {
      const result = normalizeBusinessType('رستوران');
      expect(result).not.toBeNull();
      expect(result!.canonical).toBe('رستوران');
    });
  });
});
