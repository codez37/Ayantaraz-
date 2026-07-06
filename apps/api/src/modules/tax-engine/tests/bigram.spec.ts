import { extractBigrams } from '../search/bigram';

describe('extractBigrams', () => {
  it('should extract bigrams from 2 words', () => {
    expect(extractBigrams(['مالیات', 'بر'])).toEqual(['مالیات بر']);
  });

  it('should extract bigrams from 3 words', () => {
    expect(extractBigrams(['مالیات', 'بر', 'ارث'])).toEqual([
      'مالیات بر',
      'بر ارث',
    ]);
  });

  it('should extract bigrams from 4 words', () => {
    expect(extractBigrams(['ماده', '71', 'مالیات', 'بر'])).toEqual([
      'ماده 71',
      '71 مالیات',
      'مالیات بر',
    ]);
  });

  it('should return empty array for 1 word', () => {
    expect(extractBigrams(['مالیات'])).toEqual([]);
  });

  it('should return empty array for empty input', () => {
    expect(extractBigrams([])).toEqual([]);
  });

  it('should handle duplicate words', () => {
    expect(extractBigrams(['مالیات', 'مالیات', 'مالیات'])).toEqual([
      'مالیات مالیات',
      'مالیات مالیات',
    ]);
  });
});
