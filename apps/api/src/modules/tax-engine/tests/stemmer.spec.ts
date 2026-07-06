import { stem } from '../search/stemmer';

describe('stem', () => {
  it('should return original words', () => {
    const result = stem('مالیات بر ارث');
    expect(result).toContain('مالیات');
    expect(result).toContain('بر');
    expect(result).toContain('ارث');
  });

  it('should expand words with prefix می', () => {
    const result = stem('می‌شود');
    expect(result).toContain('می');
    expect(result).toContain('شود');
  });

  it('should expand words with suffix های', () => {
    const result = stem('درآمدهای');
    expect(result).toContain('درامدهای');
    expect(result).toContain('درامده');
  });

  it('should expand words with suffix ها', () => {
    const result = stem('کتابها');
    expect(result).toContain('کتابها');
    expect(result).toContain('کتاب');
  });

  it('should expand words with suffix ان', () => {
    const result = stem('کارمندان');
    expect(result).toContain('کارمندان');
    expect(result).toContain('کارمند');
  });

  it('should expand words with suffix ات', () => {
    const result = stem('معلومات');
    expect(result).toContain('معلومات');
    expect(result).toContain('معلوم');
  });

  it('should expand words with suffix یدن', () => {
    const result = stem('دویدن');
    expect(result).toContain('دویدن');
    expect(result).toContain('دو');
  });

  it('should handle می prefix with ZWNJ', () => {
    const result = stem('می‌توانند');
    expect(result).toContain('می');
    expect(result).toContain('توانند');
  });

  it('should filter single-character words', () => {
    const result = stem('ا ب مالیات');
    expect(result).not.toContain('ا');
    expect(result).not.toContain('ب');
    expect(result).toContain('مالیات');
  });

  it('should handle multiple transformations on same input', () => {
    const result = stem('می‌توانند');
    expect(result).toContain('می');
    expect(result).toContain('توانند');
  });

  it('should normalize before stemming', () => {
    const result = stem('مَآلِيَات');
    expect(result).toContain('مالیات');
  });
});
