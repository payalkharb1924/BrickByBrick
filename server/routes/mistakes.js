const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createMistake, getMistakes, updateMistake, deleteMistake } = require('../controllers/mistakeController');

router.use(protect);

router.post('/', createMistake);
router.get('/', getMistakes);
router.put('/:id', updateMistake);
router.delete('/:id', deleteMistake);

module.exports = router;
