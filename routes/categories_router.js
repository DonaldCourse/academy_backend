const express = require('express');
const { createCategories, findAllCategories, findDescendants } = require('../controllers/categories_controller');
const { protect, authorize } = require('../middlewares/auth');
const courseRoutes = require('./course_router');

const router = express.Router();

router.route('/')
    .get(findAllCategories)

router.route('/descendants')
    .get(findDescendants)

router.use('/:categoriesId/courses', courseRoutes);

module.exports = router;
