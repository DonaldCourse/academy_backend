const express = require('express');
const { createCourse, getCourses } = require('../controllers/courses_controller');
const advancedResult = require('../middlewares/advancedResult');
const { protect, authorize } = require('../middlewares/auth');
const { body, check } = require('express-validator');
const Course = require('../models/Courses')
const router = express.Router({ mergeParams: true });

router.route('/')
    .post(
        body('title').isString().notEmpty(),
        body('description').isString().notEmpty().isLength({ min: 10 }),
        body('minimum_skill').isString().isEmpty(),
        body('weeks').isInt().notEmpty(),
        body('tuition').isInt().notEmpty(),
        body('discount').isInt().notEmpty(),
        protect,
        authorize('teacher, administrator'),
        createCourse)
    .get(advancedResult(Course, { path: 'categories_id', select: 'name' }), getCourses);

module.exports = router;
