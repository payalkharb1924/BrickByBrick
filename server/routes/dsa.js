const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createEntry, getEntries, updateEntry, deleteEntry, getRevisionsToday } = require('../controllers/dsaController');

router.use(protect);

// Must be before /:id to avoid route conflict
router.get('/revisions/today', getRevisionsToday);

router.get('/', getEntries);
router.post('/', createEntry);
router.put('/:id', updateEntry);
router.delete('/:id', deleteEntry);

module.exports = router;
