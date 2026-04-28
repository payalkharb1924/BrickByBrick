const mongoose = require('mongoose');

const MistakeLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  problemName: { type: String, required: true },
  mistakeType: { type: String, required: true },
  lesson: { type: String },
  dsaEntry: { type: mongoose.Schema.Types.ObjectId, ref: 'DSAEntry' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('MistakeLog', MistakeLogSchema);
