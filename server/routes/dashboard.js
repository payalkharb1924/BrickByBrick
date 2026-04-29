const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getToday, getProgress, getAlerts, getActivity, getUpcoming, getFocus, getTodayOverview, getStreak } = require('../controllers/dashboardController');

router.use(protect);

router.get('/today', getToday);
router.get('/progress', getProgress);
router.get('/alerts', getAlerts);
router.get('/activity', getActivity);
router.get('/upcoming', getUpcoming);
router.get('/focus', getFocus);
router.get('/today-overview', getTodayOverview);
router.get('/streak', getStreak);

module.exports = router;
