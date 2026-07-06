import { ResponseFormatterService } from '../response/response-formatter.service';
import { SearchResult } from '../interfaces/search-result.interface';
import { CalcResult } from '../interfaces/calc-result.interface';

describe('ResponseFormatterService', () => {
  let service: ResponseFormatterService;

  beforeEach(() => {
    service = new ResponseFormatterService();
  });

  describe('formatSearch', () => {
    it('should format with search results', () => {
      const results: SearchResult[] = [
        {
          articleNumber: '71',
          title: 'ماده ۷۱',
          text: 'ماده ۷۱ متن قانونی',
          notes: ['تبصره ۱'],
          score: 10,
          book: 'DIRECT',
        },
      ];
      const output = service.formatSearch('ماده ۷۱', results);
      expect(output).toContain('ماده ۷۱');
      expect(output).toContain('تبصره ۱');
      expect(output).toContain('ماده ۷۱ متن قانونی');
    });

    it('should return no results message when results empty', () => {
      const output = service.formatSearch('ماده ۹۹۹', []);
      expect(output).toContain('نتیجه‌ای یافت نشد');
    });
  });

  describe('formatCalc', () => {
    it('should format SALARY result with table', () => {
      const computation: CalcResult = {
        type: 'SALARY',
        grossAmount: 15000000,
        exemptionAmount: 12000000,
        taxableAmount: 3000000,
        taxAmount: 300000,
        annualTaxAmount: 3600000,
        effectiveRate: 2,
        breakdown: [
          { range: '۰ - ۱۲۰۰۰۰۰۰', rate: 0, taxable: 12000000, tax: 0 },
          {
            range: '۱۲۰۰۰۰۰۱ - ۱۵۰۰۰۰۰۰',
            rate: 10,
            taxable: 3000000,
            tax: 300000,
          },
        ],
      };

      const output = service.formatCalc(computation, ['84', '85']);

      expect(output).toContain('محاسبه');
      expect(output).toContain('مالیات بر حقوق');
      expect(output).toContain('۱۵,۰۰۰,۰۰۰');
      expect(output).toContain('۳۰۰,۰۰۰');
      expect(output).toContain('مواد قانونی مرتبط');
      expect(output).toContain('84');
      expect(output).toContain('85');
    });

    it('should format with article refs', () => {
      const computation: CalcResult = {
        type: 'SALARY',
        grossAmount: 10000000,
        taxableAmount: 0,
        taxAmount: 0,
        effectiveRate: 0,
      };

      const output = service.formatCalc(computation, ['84']);

      expect(output).toContain('مواد قانونی مرتبط');
    });

    it('should handle empty breakdown', () => {
      const computation: CalcResult = {
        type: 'CORPORATE',
        grossAmount: 100000000,
        taxableAmount: 100000000,
        taxAmount: 25000000,
        effectiveRate: 25,
      };

      const output = service.formatCalc(computation, ['105']);

      expect(output).toContain('محاسبه');
      expect(output).toContain('شرکت');
    });
  });

  describe('formatProcedure', () => {
    it('should format numbered steps', () => {
      const steps = [
        'دریافت برگ تشخیص',
        'تنظیم اعتراض کتبی',
        'بررسی در هیأت بدوی',
      ];
      const output = service.formatProcedure('مراحل اعتراض', steps, ['238']);

      expect(output).toContain('مراحل اعتراض');
      expect(output).toContain('۱.');
      expect(output).toContain('۲.');
      expect(output).toContain('۳.');
      expect(output).toContain('دریافت برگ تشخیص');
      expect(output).toContain('مواد قانونی مرتبط');
      expect(output).toContain('238');
    });

    it('should format with article refs', () => {
      const output = service.formatProcedure(
        'test',
        ['step 1'],
        ['238', '251'],
      );
      expect(output).toContain('238، 251');
    });
  });

  describe('formatUnknown', () => {
    it('should return polite message with examples', () => {
      const output = service.formatUnknown();
      expect(output).toContain('متوجه');
      expect(output).toContain('ماده ۱۱۴');
      expect(output).toContain('۱۵ میلیون');
    });
  });

  describe('formatArticleDetail', () => {
    it('should format article with details', () => {
      const article = {
        articleNumber: '71',
        text: 'ماده ۷۱ متن کامل',
        notes: ['تبصره ۱'],
        chapterTitle: 'فصل چهارم',
      };

      const output = service.formatArticleDetail(article);
      expect(output).toContain('ماده ۷۱');
      expect(output).toContain('فصل چهارم');
      expect(output).toContain('تبصره ۱');
    });

    it('should format article without notes', () => {
      const article = {
        articleNumber: '1',
        text: 'ماده ۱',
        notes: [],
        chapterTitle: 'فصل اول',
      };

      const output = service.formatArticleDetail(article);
      expect(output).toContain('ماده ۱');
      expect(output).not.toContain('💡');
    });
  });
});
