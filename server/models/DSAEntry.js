const mongoose = require('mongoose');

const DSAEntrySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true, default: Date.now },
  topic: { type: String, required: true },
  problemName: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  timeTaken: { type: Number, min: 0 },
  solved: { type: Boolean, required: true, default: false },
  pattern: { type: String },
  mistake: { type: String },
  revisionDates: { type: [Date], default: [] },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('DSAEntry', DSAEntrySchema);
