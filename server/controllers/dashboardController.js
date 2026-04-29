const dayjs = require('dayjs');
const isoWeek = require('dayjs/plugin/isoWeek');
dayjs.extend(isoWeek);

const DSAEntry = require('../models/DSAEntry');
const JobApplication = require('../models/JobApplication');
const WeeklyReview = require('../models/WeeklyReview');
const MistakeLog = require('../models/MistakeLog');

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

// GET /api/dashboard/activity — real recent activity from DB
const getActivity = async (req, res) => {
  try {
    const limit = 8;

    const [recentDSA, recentJobs, recentRevisions, recentReferrals] = await Promise.all([
      // Recently solved DSA problems
      DSAEntry.find({ user: req.user.id, solved: true })
        .sort({ date: -1 }).limit(limit).select('problemName difficulty date topic'),
      // Recently applied jobs
      JobApplication.find({ user: req.user.id })
        .sort({ date: -1 }).limit(limit).select('company role date status referral'),
      // Recently completed revisions (entries whose revisionDates are in the past 7 days)
      DSAEntry.find({
        user: req.user.id,
        solved: true,
        revisionDates: { $elemMatch: { $lte: dayjs().endOf('day').toDate(), $gte: dayjs().subtract(7, 'day').startOf('day').toDate() } },
      }).sort({ date: -1 }).limit(4).select('problemName date'),
      // Referral applications
      JobApplication.find({ user: req.user.id, referral: true })
        .sort({ date: -1 }).limit(4).select('company role date'),
    ]);

    const activities = [];

    for (const e of recentDSA) {
      activities.push({ type: 'dsa', text: `Solved "${e.problemName}" (${e.difficulty})`, time: e.date, topic: e.topic });
    }
    for (const j of recentJobs) {
      if (!j.referral) activities.push({ type: 'job', text: `Applied to ${j.company} - ${j.role}`, time: j.date });
    }
    for (const r of recentRevisions) {
      activities.push({ type: 'revision', text: `Revision completed: ${r.problemName}`, time: r.date });
    }
    for (const ref of recentReferrals) {
      activities.push({ type: 'referral', text: `Referral asked at ${ref.company}`, time: ref.date });
    }

    // Sort by time desc, take top 8
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));

    res.json({ success: true, data: activities.slice(0, 8) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/dashboard/upcoming — real upcoming revisions, follow-ups, reviews
const getUpcoming = async (req, res) => {
  try {
    const now = dayjs();
    const in14Days = now.add(14, 'day').endOf('day').toDate();

    const [upcomingRevisions, upcomingFollowUps, lastReview] = await Promise.all([
      // DSA entries with revision dates in the next 14 days
      DSAEntry.find({
        user: req.user.id,
        solved: true,
        revisionDates: { $elemMatch: { $gte: now.startOf('day').toDate(), $lte: in14Days } },
      }).sort({ 'revisionDates': 1 }).limit(5).select('problemName revisionDates'),
      // Job follow-ups due in next 14 days
      JobApplication.find({
        user: req.user.id,
        followUpDate: { $gte: now.startOf('day').toDate(), $lte: in14Days },
        status: 'No Response',
      }).sort({ followUpDate: 1 }).limit(5).select('company role followUpDate'),
      // Last weekly review to determine next review date
      WeeklyReview.findOne({ user: req.user.id }).sort({ weekStartDate: -1 }).select('weekStartDate'),
    ]);

    const items = [];

    for (const entry of upcomingRevisions) {
      const nextDate = entry.revisionDates
        .filter(d => dayjs(d).isAfter(now.startOf('day')))
        .sort((a, b) => new Date(a) - new Date(b))[0];
      if (nextDate) {
        items.push({ type: 'revision', text: `Revision: ${entry.problemName}`, date: nextDate });
      }
    }

    for (const job of upcomingFollowUps) {
      items.push({ type: 'followup', text: `Follow up: ${job.company}`, date: job.followUpDate });
    }

    // Next Sunday for weekly review
    const nextSunday = now.day() === 0 ? now.toDate() : now.day(7).toDate();
    items.push({ type: 'review', text: 'Weekly Review', date: nextSunday });

    items.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({ success: true, data: items.slice(0, 7) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/dashboard/focus — weak topics from mistakes + DSA data
const getFocus = async (req, res) => {
  try {
    const weekStart = dayjs().startOf('isoWeek').toDate();

    const [mistakes, lastReview, thisWeekDSA] = await Promise.all([
      MistakeLog.find({ user: req.user.id }).select('mistakeType problemName'),
      WeeklyReview.findOne({ user: req.user.id }).sort({ weekStartDate: -1 }).select('weakTopics nextWeekFocus'),
      DSAEntry.find({ user: req.user.id, date: { $gte: weekStart } }).select('topic difficulty solved'),
    ]);

    // Find most repeated mistake type
    const mistakeCounts = {};
    for (const m of mistakes) {
      mistakeCounts[m.mistakeType] = (mistakeCounts[m.mistakeType] || 0) + 1;
    }
    const topMistake = Object.entries(mistakeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    // Find topic with most unsolved attempts this week
    const topicStats = {};
    for (const e of thisWeekDSA) {
      if (!topicStats[e.topic]) topicStats[e.topic] = { solved: 0, total: 0 };
      topicStats[e.topic].total++;
      if (e.solved) topicStats[e.topic].solved++;
    }
    const weakTopic = Object.entries(topicStats)
      .filter(([, s]) => s.total > 0)
      .sort((a, b) => (a[1].solved / a[1].total) - (b[1].solved / b[1].total))[0]?.[0]
      || lastReview?.weakTopics?.[0]
      || null;

    res.json({
      success: true,
      data: {
        weakTopic,
        topMistake,
        improvement: lastReview?.nextWeekFocus || null,
        weeklyReviewWeakTopics: lastReview?.weakTopics || [],
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/dashboard/today-overview — detailed breakdown for Today's Overview section
const getTodayOverview = async (req, res) => {
  try {
    const todayStart = dayjs().startOf('day').toDate();
    const todayEnd = dayjs().endOf('day').toDate();
    const dailyTarget = 4; // default; could come from user settings later

    const [todayDSA, todayJobs, followUpsDue, overdueRevisions, dueToday] = await Promise.all([
      DSAEntry.find({ user: req.user.id, date: { $gte: todayStart, $lte: todayEnd } }).select('difficulty solved'),
      JobApplication.find({ user: req.user.id, date: { $gte: todayStart, $lte: todayEnd } }).select('referral status'),
      JobApplication.countDocuments({ user: req.user.id, followUpDate: { $lte: todayEnd }, status: 'No Response' }),
      DSAEntry.countDocuments({
        user: req.user.id, solved: true,
        revisionDates: { $elemMatch: { $lt: todayStart } },
      }),
      DSAEntry.countDocuments({
        user: req.user.id, solved: true,
        revisionDates: { $elemMatch: { $gte: todayStart, $lte: todayEnd } },
      }),
    ]);

    const dsaBreakdown = { Easy: 0, Medium: 0, Hard: 0 };
    for (const e of todayDSA) if (e.solved && dsaBreakdown[e.difficulty] !== undefined) dsaBreakdown[e.difficulty]++;

    const appBreakdown = {
      applied: todayJobs.length,
      referrals: todayJobs.filter(j => j.referral).length,
      followUps: followUpsDue,
    };

    res.json({
      success: true,
      data: {
        dsa: { solved: todayDSA.filter(e => e.solved).length, target: dailyTarget, breakdown: dsaBreakdown },
        applications: appBreakdown,
        revisions: { dueToday, overdue: overdueRevisions },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getToday, getProgress, getAlerts, getActivity, getUpcoming, getFocus, getTodayOverview };
// GET /api/dashboard/streak — daily streak (consecutive days with ≥1 DSA entry logged)
const getStreak = async (req, res) => {
  try {
    const entries = await DSAEntry.find(
      { user: req.user.id },  // count any entry, not just solved
      { date: 1 }
    ).sort({ date: -1 });

    let dailyStreak = 0;
    if (entries.length > 0) {
      // Normalize each entry date to YYYY-MM-DD in local-equivalent UTC
      const daysWithActivity = new Set(
        entries.map(e => dayjs(e.date).format('YYYY-MM-DD'))
      );

      // Walk back from today counting consecutive days
      let checkDay = dayjs().startOf('day');
      while (daysWithActivity.has(checkDay.format('YYYY-MM-DD'))) {
        dailyStreak++;
        checkDay = checkDay.subtract(1, 'day');
      }
    }

    res.json({ success: true, data: { dailyStreak } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getToday, getProgress, getAlerts, getActivity, getUpcoming, getFocus, getTodayOverview, getStreak };
