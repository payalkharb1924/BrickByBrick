const dayjs = require('dayjs');
const isoWeek = require('dayjs/plugin/isoWeek');
dayjs.extend(isoWeek);

const WeeklyReview = require('../models/WeeklyReview');
const DSAEntry = require('../models/DSAEntry');
const JobApplication = require('../models/JobApplication');

// POST /api/reviews
const createReview = async (req, res) => {
  try {
    const {
      weekStartDate, totalProblemsSolved, mediumCount, hardCount,
      weakTopics, applicationsSent, referralsSent, responsesReceived,
      insights, nextWeekFocus,
    } = req.body;

    if (!weekStartDate) {
      return res.status(400).json({ success: false, message: 'weekStartDate is required' });
    }

    const review = await WeeklyReview.create({
      user: req.user.id,
      weekStartDate,
      totalProblemsSolved,
      mediumCount,
      hardCount,
      weakTopics,
      applicationsSent,
      referralsSent,
      responsesReceived,
      insights,
      nextWeekFocus,
    });

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/reviews
const getReviews = async (req, res) => {
  try {
    const reviews = await WeeklyReview.find({ user: req.user.id }).sort({ weekStartDate: -1 });
    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/reviews/:id
const updateReview = async (req, res) => {
  try {
    const review = await WeeklyReview.findOne({ _id: req.params.id, user: req.user.id });
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    Object.assign(review, req.body);
    await review.save();

    res.json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/reviews/autofill
const autofillReview = async (req, res) => {
  try {
    const weekStart = dayjs().startOf('isoWeek').toDate();
    const weekEnd = dayjs().endOf('isoWeek').toDate();

    const [dsaEntries, jobApplications] = await Promise.all([
      DSAEntry.find({
        user: req.user.id,
        date: { $gte: weekStart, $lte: weekEnd },
        solved: true,
      }),
      JobApplication.find({
        user: req.user.id,
        date: { $gte: weekStart, $lte: weekEnd },
      }),
    ]);

    const totalProblemsSolved = dsaEntries.length;
    const mediumCount = dsaEntries.filter(e => e.difficulty === 'Medium').length;
    const hardCount = dsaEntries.filter(e => e.difficulty === 'Hard').length;

    const applicationsSent = jobApplications.length;
    const referralsSent = jobApplications.filter(a => a.referral === true).length;
    const responsesReceived = jobApplications.filter(
      a => a.status !== 'Applied' && a.status !== 'No Response'
    ).length;

    res.json({
      success: true,
      data: {
        weekStartDate: weekStart,
        totalProblemsSolved,
        mediumCount,
        hardCount,
        applicationsSent,
        referralsSent,
        responsesReceived,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/reviews/:id
const deleteReview = async (req, res) => {
  try {
    const review = await WeeklyReview.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createReview, getReviews, updateReview, deleteReview, autofillReview };
