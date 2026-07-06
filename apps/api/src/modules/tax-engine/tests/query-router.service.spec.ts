import { QueryRouterService } from '../router/query-router.service';

describe('QueryRouterService', () => {
  let service: QueryRouterService;

  beforeEach(() => {
    service = new QueryRouterService();
  });

  describe('SEARCH detection', () => {
    it('should detect SEARCH for "ماده ۱۱۴"', () => {
      expect(service.detect('ماده ۱۱۴')).toBe('SEARCH');
    });

    it('should detect SEARCH for "بند ۳ ماده ۷۱"', () => {
      expect(service.detect('بند ۳ ماده ۷۱')).toBe('SEARCH');
    });

    it('should detect SEARCH for "تبصره ۲ ماده ۸۴"', () => {
      expect(service.detect('تبصره ۲ ماده ۸۴')).toBe('SEARCH');
    });

    it('should detect SEARCH for "نرخ مالیات بر ارث چقدر است؟"', () => {
      expect(service.detect('نرخ مالیات بر ارث چقدر است؟')).toBe('SEARCH');
    });

    it('should detect SEARCH for "معافیت مالیاتی حقوق"', () => {
      expect(service.detect('معافیت مالیاتی حقوق')).toBe('SEARCH');
    });

    it('should detect SEARCH for "مالیات بر درآمد مشاغل"', () => {
      expect(service.detect('مالیات بر درآمد مشاغل')).toBe('SEARCH');
    });
  });

  describe('CALC detection', () => {
    it('should detect CALC for "محاسبه کن"', () => {
      expect(service.detect('محاسبه کن')).toBe('CALC');
    });

    it('should detect CALC for "مالیات حقوق ۱۵ میلیون"', () => {
      expect(service.detect('مالیات حقوق ۱۵ میلیون')).toBe('CALC');
    });

    it('should detect CALC for "۱۵ میلیون تومان مالیات"', () => {
      expect(service.detect('۱۵ میلیون تومان مالیات')).toBe('CALC');
    });

    it('should detect CALC for "مالیات حقوق ۱۵ میلیون چقدر می‌شود؟"', () => {
      expect(service.detect('مالیات حقوق ۱۵ میلیون چقدر می‌شود؟')).toBe('CALC');
    });

    it('should detect CALC for "مبلغ ۱۰ میلیون اجاره"', () => {
      expect(service.detect('مبلغ ۱۰ میلیون اجاره')).toBe('CALC');
    });

    it('should detect CALC for "حساب کن مالیات ۲۰ میلیون"', () => {
      expect(service.detect('حساب کن مالیات ۲۰ میلیون')).toBe('CALC');
    });
  });

  describe('PROCEDURE detection', () => {
    it('should detect PROCEDURE for "مدارک لازم برای ثبت‌نام"', () => {
      expect(service.detect('مدارک لازم برای ثبت‌نام')).toBe('PROCEDURE');
    });

    it('should detect PROCEDURE for "چگونه می‌توانم اعتراض کنم؟"', () => {
      expect(service.detect('چگونه می‌توانم اعتراض کنم؟')).toBe('PROCEDURE');
    });

    it('should detect PROCEDURE for "مهلت تسلیم اظهارنامه"', () => {
      expect(service.detect('مهلت تسلیم اظهارنامه')).toBe('PROCEDURE');
    });

    it('should detect PROCEDURE for "مراحل ثبت‌نام در سامانه"', () => {
      expect(service.detect('مراحل ثبت‌نام در سامانه')).toBe('PROCEDURE');
    });

    it('should detect PROCEDURE for "نحوه اعتراض به برگ تشخیص"', () => {
      expect(service.detect('نحوه اعتراض به برگ تشخیص')).toBe('PROCEDURE');
    });
  });

  describe('UNKNOWN detection', () => {
    it('should return UNKNOWN for "سلام"', () => {
      expect(service.detect('سلام')).toBe('UNKNOWN');
    });

    it('should return UNKNOWN for "خوبی؟"', () => {
      expect(service.detect('خوبی؟')).toBe('UNKNOWN');
    });

    it('should return UNKNOWN for "چطوری؟"', () => {
      expect(service.detect('چطوری؟')).toBe('UNKNOWN');
    });

    it('should return UNKNOWN for empty string', () => {
      expect(service.detect('')).toBe('UNKNOWN');
    });

    it('should return UNKNOWN for nonsense text', () => {
      expect(service.detect('lorem ipsum dolor sit amet')).toBe('UNKNOWN');
    });
  });

  describe('priority scoring', () => {
    it('should prefer SEARCH over CALC when both match but SEARCH has higher priority match', () => {
      expect(service.detect('ماده ۸۴ مالیات حقوق ۱۵ میلیون')).toBe('SEARCH');
    });

    it('should prefer CALC over SEARCH when amount pattern matches with calc keywords', () => {
      expect(service.detect('محاسبه مالیات حقوق ۱۵ میلیون')).toBe('CALC');
    });

    it('should prefer PROCEDURE over SEARCH when procedure keywords dominate', () => {
      expect(service.detect('مراحل اعتراض به برگ تشخیص ماده ۲۳۸')).toBe(
        'PROCEDURE',
      );
    });

    it('should return UNKNOWN for equal zero scores', () => {
      expect(service.detect('')).toBe('UNKNOWN');
    });
  });
});
