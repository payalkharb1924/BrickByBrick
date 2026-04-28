const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createReview, getReviews, updateReview, autofillReview } = require('../controllers/reviewController');

router.use(protect);

// /autofill must be before /:id
router.get('/autofill', autofillReview);

router.post('/', createReview);
router.get('/', getReviews);
router.put('/:id', updateReview);

module.exports = router;
