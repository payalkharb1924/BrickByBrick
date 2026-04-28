const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getToday, getProgress, getAlerts } = require('../controllers/dashboardController');

router.use(protect);

router.get('/today', getToday);
router.get('/progress', getProgress);
router.get('/alerts', getAlerts);

module.exports = router;
