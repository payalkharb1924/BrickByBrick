const MistakeLog = require('../models/MistakeLog');

// POST /api/mistakes
const createMistake = async (req, res) => {
  try {
    const { problemName, mistakeType, lesson, dsaEntry } = req.body;

    if (!problemName || !mistakeType) {
      return res.status(400).json({ success: false, message: 'problemName and mistakeType are required' });
    }

    const mistake = await MistakeLog.create({
      user: req.user.id,
      problemName,
      mistakeType,
      lesson,
      dsaEntry,
    });

    res.status(201).json({ success: true, data: mistake });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/mistakes
const getMistakes = async (req, res) => {
  try {
    const { mistakeType } = req.query;
    const filter = { user: req.user.id };

    if (mistakeType) {
      filter.mistakeType = { $regex: mistakeType, $options: 'i' };
    }

    const mistakes = await MistakeLog.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: mistakes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/mistakes/:id
const updateMistake = async (req, res) => {
  try {
    const mistake = await MistakeLog.findOne({ _id: req.params.id, user: req.user.id });
    if (!mistake) return res.status(404).json({ success: false, message: 'Mistake log not found' });

    Object.assign(mistake, req.body);
    await mistake.save();

    res.json({ success: true, data: mistake });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/mistakes/:id
const deleteMistake = async (req, res) => {
  try {
    const mistake = await MistakeLog.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!mistake) return res.status(404).json({ success: false, message: 'Mistake log not found' });

    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createMistake, getMistakes, updateMistake, deleteMistake };
