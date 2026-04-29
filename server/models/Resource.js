const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:    { type: String, required: true },
  url:      { type: String, default: '' },
  category: { type: String, enum: ['DSA', 'System Design', 'Behavioral', 'Resume', 'Other'], default: 'DSA' },
  notes:    { type: String, default: '' },
  starred:  { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Resource', resourceSchema);
