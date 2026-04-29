const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:    { type: String, required: true },
  category: { type: String, enum: ['DSA', 'Jobs', 'Learning', 'Personal'], default: 'DSA' },
  target:   { type: Number, required: true, min: 1 },
  current:  { type: Number, default: 0 },
  done:     { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Goal', goalSchema);
