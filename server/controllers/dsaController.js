const dayjs = require('dayjs');
const DSAEntry = require('../models/DSAEntry');
const { computeRevisionDates } = require('../utils/revisionDates');

// POST /api/dsa
const createEntry = async (req, res) => {
  try {
    const { topic, problemName, difficulty, solved, date, timeTaken, pattern, mistake, notes } = req.body;

    if (!topic || !problemName || !difficulty || solved === undefined) {
      return res.status(400).json({ success: false, message: 'topic, problemName, difficulty, and solved are required' });
    }

    const entryDate = date ? dayjs(date) : dayjs();
    const revisionDates = computeRevisionDates(entryDate.toDate());

    const entry = await DSAEntry.create({
      user: req.user.id,
      date: entryDate.toDate(),
      topic,
      problemName,
      difficulty,
      solved,
      timeTaken,
      pattern,
      mistake,
      notes,
      revisionDates,
    });

    res.status(201).json({ success: true, data: entry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/dsa
const getEntries = async (req, res) => {
  try {
    const { topic, difficulty, solved, sortBy, order, page = 1, limit = 20 } = req.query;

    const filter = { user: req.user.id };

    if (topic) filter.topic = { $regex: topic, $options: 'i' };
    if (difficulty) filter.difficulty = difficulty;
    if (solved !== undefined) filter.solved = solved === 'true';

    const sortOrder = order === 'desc' ? -1 : 1;
    const validSortFields = ['date', 'difficulty', 'timeTaken'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'date';
    const sort = { [sortField]: sortOrder };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const [entries, total] = await Promise.all([
      DSAEntry.find(filter).sort(sort).skip(skip).limit(limitNum),
      DSAEntry.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: entries,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/dsa/:id
const updateEntry = async (req, res) => {
  try {
    const entry = await DSAEntry.findOne({ _id: req.params.id, user: req.user.id });
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });

    const updates = req.body;

    // Recalculate revisionDates if date is being changed
    if (updates.date) {
      updates.revisionDates = computeRevisionDates(updates.date);
    }

    Object.assign(entry, updates);
    await entry.save();

    res.json({ success: true, data: entry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/dsa/:id
const deleteEntry = async (req, res) => {
  try {
    const entry = await DSAEntry.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });

    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/dsa/revisions/today
const getRevisionsToday = async (req, res) => {
  try {
    const today = dayjs().endOf('day').toDate();

    const entries = await DSAEntry.find({
      user: req.user.id,
      solved: true,
      revisionDates: { $elemMatch: { $lte: today } },
    }).sort({ revisionDates: 1 });

    res.json({ success: true, data: entries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createEntry, getEntries, updateEntry, deleteEntry, getRevisionsToday };
