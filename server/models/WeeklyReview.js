const mongoose = require('mongoose');

const WeeklyReviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  weekStartDate: { type: Date, required: true },
  totalProblemsSolved: { type: Number, default: 0 },
  mediumCount: { type: Number, default: 0 },
  hardCount: { type: Number, default: 0 },
  weakTopics: { type: [String], default: [] },
  applicationsSent: { type: Number, default: 0 },
  referralsSent: { type: Number, default: 0 },
  responsesReceived: { type: Number, default: 0 },
  insights: { type: String },
  nextWeekFocus: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('WeeklyReview', WeeklyReviewSchema);
