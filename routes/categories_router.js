const express = require('express');
const { createCategories, findAllCategoriesOfRoot, findDescendants } = require('../controllers/categories_controller');
const { protect, authorize } = require('../middlewares/auth');
const courseRoutes = require('./course_router');

const router = express.Router();

router.route('/')
    .get(findAllCategoriesOfRoot)
    .post(protect, authorize('administrator'), createCategories);

router.route('/descendants')
    .get(findDescendants)

router.use('/:categoriesId/courses', courseRoutes);

module.exports = router;
