const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getResources, createResource, updateResource, deleteResource } = require('../controllers/resourceController');

router.use(protect);
router.get('/', getResources);
router.post('/', createResource);
router.put('/:id', updateResource);
router.delete('/:id', deleteResource);

module.exports = router;
