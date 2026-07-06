import { normalizePersian } from '../search/normalizer';

describe('normalizePersian', () => {
  it('should replace ي with ی', () => {
    expect(normalizePersian('ايران')).toBe('ایران');
  });

  it('should replace ك with ک', () => {
    expect(normalizePersian('كتاب')).toBe('کتاب');
  });

  it('should replace ئ with ی', () => {
    expect(normalizePersian('مسئله')).toBe('مسیله');
  });

  it('should replace آ and أ with ا', () => {
    expect(normalizePersian('آب أباد')).toBe('اب اباد');
  });

  it('should replace ؤ with و', () => {
    expect(normalizePersian('مسؤول')).toBe('مسوول');
  });

  it('should replace ۀ with ه', () => {
    expect(normalizePersian('مۀ')).toBe('مه');
  });

  it('should normalize whitespace', () => {
    expect(normalizePersian('  مالیات   بر   ارث  ')).toBe('مالیات بر ارث');
  });

  it('should remove Arabic diacritics', () => {
    expect(normalizePersian('مَالیَات')).toBe('مالیات');
  });

  it('should convert Persian digits to Latin', () => {
    expect(normalizePersian('ماده ۱۲۳۴')).toBe('ماده 1234');
  });

  it('should convert mixed Arabic-Persian digits', () => {
    expect(normalizePersian('ماده ۱۲۳۴٥٦')).toBe('ماده 123456');
  });

  it('should remove tatweel/kashida', () => {
    expect(normalizePersian('مالیاتـــ')).toBe('مالیات');
  });

  it('should handle complex mixed text', () => {
    const input = '  قَانُونِ مَآلِيَاتٍ ۱۲۳٤٥ ';
    const result = normalizePersian(input);
    expect(result).toBe('قانون مالیات 12345');
  });

  it('should trim leading and trailing spaces', () => {
    expect(normalizePersian('  مالیات  ')).toBe('مالیات');
  });

  it('should handle empty string', () => {
    expect(normalizePersian('')).toBe('');
  });

  it('should handle remove Arabic diacritics', () => {
    expect(normalizePersian('فًقٍطٌ')).toBe('فقط');
  });
});
