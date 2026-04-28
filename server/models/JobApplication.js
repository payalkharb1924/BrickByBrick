const mongoose = require('mongoose');

const JobApplicationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true, default: Date.now },
  company: { type: String, required: true },
  role: { type: String, required: true },
  source: {
    type: String,
    enum: ['Careers Page', 'LinkedIn', 'Referral', 'Other'],
    required: true,
  },
  referral: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['Applied', 'Referral Asked', 'Interview Scheduled', 'Rejected', 'No Response'],
    default: 'Applied',
  },
  followUpDate: { type: Date },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('JobApplication', JobApplicationSchema);
