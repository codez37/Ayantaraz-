import { ConfidenceEngineService } from '../confidence/confidence-engine.service';
import { EntityExtractorService } from '../confidence/entity-extractor.service';

describe('ConfidenceEngine - Scenario Tests', () => {
  let engine: ConfidenceEngineService;
  let extractor: EntityExtractorService;

  beforeEach(() => {
    extractor = new EntityExtractorService();
    engine = new ConfidenceEngineService(extractor);
  });

  describe('Scenario 1: "درآمدم 4 میلیارد بود"', () => {
    it('should have low confidence (missing business type + year)', () => {
      const result = engine.evaluate('درآمدم 4 میلیارد بود', 'BUSINESS');
      expect(result.isConfident).toBe(false);
      expect(result.score).toBeLessThan(70);
      expect(result.clarificationPrompt).toBeTruthy();
      expect(result.missingSlots.length).toBeGreaterThan(0);
    });

    it('should extract amount correctly', () => {
      const result = engine.evaluate('درآمدم 4 میلیارد بود', 'BUSINESS');
      expect(result.entities.amount).toBe(4000000000);
    });

    it('should ask for business type', () => {
      const result = engine.evaluate('درآمدم 4 میلیارد بود', 'BUSINESS');
      const missingNames = result.missingSlots.map((s) => s.name);
      expect(missingNames).toContain('businessType');
    });
  });

  describe('Scenario 2: "درآمدم 4 میلیارد تومان بود"', () => {
    it('should detect currency unit as تومان', () => {
      const result = engine.evaluate('درآمدم 4 میلیارد تومان بود', 'BUSINESS');
      expect(result.entities.amountUnit).toBe('تومان');
    });

    it('should extract amount', () => {
      const result = engine.evaluate('درآمدم 4 میلیارد تومان بود', 'BUSINESS');
      expect(result.entities.amount).toBe(4000000000);
    });
  });

  describe('Scenario 3: "درآمد 4,526,720,000 ریال"', () => {
    it('should detect amount but not business type', () => {
      const result = engine.evaluate('درآمد 4,526,720,000 ریال', 'BUSINESS');
      expect(result.entities.amount).toBe(4526720000);
      expect(result.entities.businessType).toBeNull();
      expect(result.isConfident).toBe(false);
    });

    it('should ask for business type', () => {
      const result = engine.evaluate('درآمد 4,526,720,000 ریال', 'BUSINESS');
      const missingNames = result.missingSlots.map((s) => s.name);
      expect(missingNames).toContain('businessType');
    });
  });

  describe('Scenario 4: "عمده فروش شیرآلات ساختمانی"', () => {
    it('should detect business type but not amount', () => {
      const result = engine.evaluate('عمده فروش شیرآلات ساختمانی', 'BUSINESS');
      expect(result.entities.businessType).toBeTruthy();
      expect(result.entities.amount).toBeNull();
      expect(result.isConfident).toBe(false);
    });

    it('should ask for amount', () => {
      const result = engine.evaluate('عمده فروش شیرآلات ساختمانی', 'BUSINESS');
      const missingNames = result.missingSlots.map((s) => s.name);
      expect(missingNames).toContain('amount');
    });
  });

  describe('Scenario 5: "نمیدونم اینتاکدم چیه"', () => {
    it('should not throw error', () => {
      expect(() => {
        engine.evaluate('نمیدونم اینتاکدم چیه', 'BUSINESS');
      }).not.toThrow();
    });

    it('should return low confidence with clarification', () => {
      const result = engine.evaluate('نمیدونم اینتاکدم چیه', 'BUSINESS');
      expect(result.isConfident).toBe(false);
      expect(result.clarificationPrompt).toBeTruthy();
    });
  });

  describe('Full calculation scenario: "درآمد 4,526,720,000 ریال عمده فروشی لوازم ساختمانی سال 1404"', () => {
    it('should be confident with all required fields', () => {
      const result = engine.evaluate(
        'درآمد 4,526,720,000 ریال عمده فروشی لوازم ساختمانی سال 1404',
        'BUSINESS',
      );
      expect(result.isConfident).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(70);
      expect(result.entities.amount).toBe(4526720000);
      expect(result.entities.year).toBe(1404);
      expect(result.entities.businessType).toBe('عمده فروشی لوازم ساختمانی');
    });
  });
});
