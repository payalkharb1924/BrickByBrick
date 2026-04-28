const { computeRevisionDates } = require('../utils/revisionDates');

describe('computeRevisionDates', () => {
  /**
   * Helper: returns a UTC Date for the given year/month(1-based)/day
   */
  function utcDate(year, month, day) {
    return new Date(Date.UTC(year, month - 1, day));
  }

  test('returns exactly two revision dates', () => {
    const [r1, r2] = computeRevisionDates(utcDate(2024, 6, 1));
    expect(r1).toBeInstanceOf(Date);
    expect(r2).toBeInstanceOf(Date);
  });

  test('first revision is entry date + 2 days', () => {
    const entry = utcDate(2024, 6, 1);
    const [r1] = computeRevisionDates(entry);
    expect(r1).toEqual(utcDate(2024, 6, 3));
  });

  test('second revision is entry date + 7 days', () => {
    const entry = utcDate(2024, 6, 1);
    const [, r2] = computeRevisionDates(entry);
    expect(r2).toEqual(utcDate(2024, 6, 8));
  });

  test('accepts a date string and offsets by 2 and 7 days', () => {
    const [r1, r2] = computeRevisionDates('2024-06-01');
    const base = r1.getTime() - 2 * 24 * 60 * 60 * 1000; // derive base from r1
    expect(r2.getTime() - base).toBe(7 * 24 * 60 * 60 * 1000);
    expect(r1.getTime() - base).toBe(2 * 24 * 60 * 60 * 1000);
  });

  // Edge case: month boundary (end of month)
  test('crosses month boundary correctly (+2 days)', () => {
    const entry = utcDate(2024, 1, 30); // Jan 30
    const [r1] = computeRevisionDates(entry);
    expect(r1).toEqual(utcDate(2024, 2, 1)); // Feb 1
  });

  test('crosses month boundary correctly (+7 days)', () => {
    const entry = utcDate(2024, 1, 26); // Jan 26
    const [, r2] = computeRevisionDates(entry);
    expect(r2).toEqual(utcDate(2024, 2, 2)); // Feb 2
  });

  // Edge case: year boundary
  test('crosses year boundary correctly (+2 days)', () => {
    const entry = utcDate(2023, 12, 30); // Dec 30
    const [r1] = computeRevisionDates(entry);
    expect(r1).toEqual(utcDate(2024, 1, 1)); // Jan 1 next year
  });

  test('crosses year boundary correctly (+7 days)', () => {
    const entry = utcDate(2023, 12, 26); // Dec 26
    const [, r2] = computeRevisionDates(entry);
    expect(r2).toEqual(utcDate(2024, 1, 2)); // Jan 2 next year
  });

  // Edge case: leap year Feb 28
  test('handles leap year Feb 28 + 2 days = Mar 1', () => {
    const entry = utcDate(2023, 2, 28); // non-leap year
    const [r1] = computeRevisionDates(entry);
    expect(r1).toEqual(utcDate(2023, 3, 2));
  });

  test('handles leap year Feb 27 + 2 days = Feb 29', () => {
    const entry = utcDate(2024, 2, 27); // 2024 is a leap year
    const [r1] = computeRevisionDates(entry);
    expect(r1).toEqual(utcDate(2024, 2, 29));
  });
});
