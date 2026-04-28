/**
 * Property-based tests for computeRevisionDates
 *
 * Validates: Requirements 15.2
 *
 * Properties verified:
 *   - For ANY valid date, revisionDates[0] is always entryDate + 2 days (in ms)
 *   - For ANY valid date, revisionDates[1] is always entryDate + 7 days (in ms)
 */

const fc = require('fast-check');
const { computeRevisionDates } = require('../utils/revisionDates');

const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

// Arbitrary: generate a Date within years 2000–2100
const validDate = fc
  .integer({ min: 2000, max: 2100 })           // year
  .chain(year =>
    fc.integer({ min: 1, max: 12 }).chain(month => {
      // Determine max days for the given year/month
      const maxDay = new Date(year, month, 0).getDate(); // day 0 of next month = last day of this month
      return fc.integer({ min: 1, max: maxDay }).map(day =>
        new Date(Date.UTC(year, month - 1, day))
      );
    })
  );

describe('computeRevisionDates – property-based', () => {
  test('revisionDates[0] is always entryDate + 2 days', () => {
    fc.assert(
      fc.property(validDate, entryDate => {
        const [r1] = computeRevisionDates(entryDate);
        expect(r1.getTime()).toBe(entryDate.getTime() + TWO_DAYS_MS);
      }),
      { numRuns: 100 }
    );
  });

  test('revisionDates[1] is always entryDate + 7 days', () => {
    fc.assert(
      fc.property(validDate, entryDate => {
        const [, r2] = computeRevisionDates(entryDate);
        expect(r2.getTime()).toBe(entryDate.getTime() + SEVEN_DAYS_MS);
      }),
      { numRuns: 100 }
    );
  });
});
