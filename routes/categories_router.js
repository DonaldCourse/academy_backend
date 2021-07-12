const express = require('express');
const { createCategories, findAllCategories, findDescendants, getCategoryDetail } = require('../controllers/categories_controller');
const { protect, authorize } = require('../middlewares/auth');
const courseRoutes = require('./course_router');

const router = express.Router();

router.route('/')
    .get(findAllCategories);

router.route('/:id')
    .get(getCategoryDetail);
    
router.route('/descendants')
    .get(findDescendants)

router.use('/:categoriesId/courses', courseRoutes);

module.exports = router;
