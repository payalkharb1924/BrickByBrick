const dayjs = require('dayjs');
const isoWeek = require('dayjs/plugin/isoWeek');
dayjs.extend(isoWeek);

const DSAEntry = require('../models/DSAEntry');
const JobApplication = require('../models/JobApplication');

// GET /api/dashboard/today
const getToday = async (req, res) => {
  try {
    const todayStart = dayjs().startOf('day').toDate();
    const todayEnd = dayjs().endOf('day').toDate();

    const [problemsSolvedToday, applicationsSentToday, revisionsDueToday] = await Promise.all([
      DSAEntry.countDocuments({
        user: req.user.id,
        date: { $gte: todayStart, $lte: todayEnd },
        solved: true,
      }),
      JobApplication.countDocuments({
        user: req.user.id,
        date: { $gte: todayStart, $lte: todayEnd },
      }),
      DSAEntry.countDocuments({
        user: req.user.id,
        solved: true,
        revisionDates: { $elemMatch: { $lte: todayEnd } },
      }),
    ]);

    res.json({
      success: true,
      data: { problemsSolvedToday, applicationsSentToday, revisionsDueToday },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/dashboard/progress
const getProgress = async (req, res) => {
  try {
    const [totalProblemsSolved, totalApplications] = await Promise.all([
      DSAEntry.countDocuments({ user: req.user.id, solved: true }),
      JobApplication.countDocuments({ user: req.user.id }),
    ]);

    // Calculate weekly streak: consecutive weeks (Mon-Sun) with at least 1 solved DSA entry
    const solvedEntries = await DSAEntry.find(
      { user: req.user.id, solved: true },
      { date: 1 }
    ).sort({ date: -1 });

    let weeklyStreak = 0;
    if (solvedEntries.length > 0) {
      // Build a set of ISO week keys (YYYY-WW) that have activity
      const weeksWithActivity = new Set(
        solvedEntries.map(e => {
          const d = dayjs(e.date);
          return `${d.isoWeek() < 10 ? d.year() + '-0' + d.isoWeek() : d.year() + '-' + d.isoWeek()}`;
        })
      );

      // Walk backwards from current week counting consecutive weeks
      let checkWeek = dayjs().startOf('isoWeek');
      while (true) {
        const key = (() => {
          const w = checkWeek.isoWeek();
          return w < 10 ? `${checkWeek.year()}-0${w}` : `${checkWeek.year()}-${w}`;
        })();
        if (!weeksWithActivity.has(key)) break;
        weeklyStreak++;
        checkWeek = checkWeek.subtract(1, 'week');
      }
    }

    res.json({
      success: true,
      data: { weeklyStreak, totalProblemsSolved, totalApplications },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/dashboard/alerts
const getAlerts = async (req, res) => {
  try {
    const now = dayjs().endOf('day').toDate();
    const threeDaysAgo = dayjs().subtract(3, 'day').startOf('day').toDate();

    const [pendingRevisions, followUpsDue, recentActivity] = await Promise.all([
      DSAEntry.countDocuments({
        user: req.user.id,
        solved: true,
        revisionDates: { $elemMatch: { $lte: now } },
      }),
      JobApplication.countDocuments({
        user: req.user.id,
        followUpDate: { $lte: now },
        status: 'No Response',
      }),
      DSAEntry.countDocuments({
        user: req.user.id,
        date: { $gte: threeDaysAgo },
      }),
    ]);

    const noActivityWarning = recentActivity === 0;

    res.json({
      success: true,
      data: { pendingRevisions, followUpsDue, noActivityWarning },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getToday, getProgress, getAlerts };
