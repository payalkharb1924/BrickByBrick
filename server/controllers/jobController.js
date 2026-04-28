const JobApplication = require('../models/JobApplication');

// POST /api/jobs
const createApplication = async (req, res) => {
  try {
    const { company, role, source, date, referral, status, followUpDate, notes } = req.body;

    if (!company || !role || !source) {
      return res.status(400).json({ success: false, message: 'company, role, and source are required' });
    }

    const application = await JobApplication.create({
      user: req.user.id,
      company,
      role,
      source,
      date,
      referral,
      status,
      followUpDate,
      notes,
    });

    res.status(201).json({ success: true, data: application });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/jobs
const getApplications = async (req, res) => {
  try {
    const { status, company, sortBy, order, page = 1, limit = 20 } = req.query;

    const filter = { user: req.user.id };

    if (status) filter.status = status;
    if (company) filter.company = { $regex: company, $options: 'i' };

    const sortOrder = order === 'desc' ? -1 : 1;
    const validSortFields = ['followUpDate', 'date'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'date';
    const sort = { [sortField]: sortOrder };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const [applications, total] = await Promise.all([
      JobApplication.find(filter).sort(sort).skip(skip).limit(limitNum),
      JobApplication.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: applications,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/jobs/:id
const updateApplication = async (req, res) => {
  try {
    const application = await JobApplication.findOne({ _id: req.params.id, user: req.user.id });
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    Object.assign(application, req.body);
    await application.save();

    res.json({ success: true, data: application });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/jobs/:id
const deleteApplication = async (req, res) => {
  try {
    const application = await JobApplication.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/jobs/followups/today
const getFollowUpsToday = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const applications = await JobApplication.find({
      user: req.user.id,
      followUpDate: { $lte: today },
      status: 'No Response',
    }).sort({ followUpDate: 1 });

    res.json({ success: true, data: applications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createApplication, getApplications, updateApplication, deleteApplication, getFollowUpsToday };
