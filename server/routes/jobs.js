const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createApplication,
  getApplications,
  updateApplication,
  deleteApplication,
  getFollowUpsToday,
} = require('../controllers/jobController');

// NOTE: /followups/today must be before /:id to avoid route conflict
router.get('/followups/today', protect, getFollowUpsToday);

router.get('/', protect, getApplications);
router.post('/', protect, createApplication);
router.put('/:id', protect, updateApplication);
router.delete('/:id', protect, deleteApplication);

module.exports = router;
