const dayjs = require('dayjs');

/**
 * Given an entry date, returns the two scheduled revision dates:
 *   - entryDate + 2 days
 *   - entryDate + 7 days
 *
 * @param {Date|string} entryDate
 * @returns {[Date, Date]}
 */
function computeRevisionDates(entryDate) {
  const d = dayjs(entryDate);
  return [d.add(2, 'day').toDate(), d.add(7, 'day').toDate()];
}

module.exports = { computeRevisionDates };
