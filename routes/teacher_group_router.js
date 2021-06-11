const express = require('express');
const { protect, authorize } = require('../middlewares/auth');
const { body } = require('express-validator');
const Catagories = require('../models/Catagories');
const { createCourseOfTeacher, getCourseOfTeacher, getCourseDetailOfTeacher, publishCourseOfTeacher, updateCourseOfTeacher } = require('../controllers/courses_controller');
const router = express.Router();
router.route('/courses')
    .get(protect, authorize('teacher'), getCourseOfTeacher)
    .post(body('title').isString().notEmpty(),
        body('overview').isString().notEmpty().isLength({ min: 10 }),
        body('description').isString().notEmpty().isLength({ min: 10 }),
        body('minimum_skill').isString().notEmpty(),
        body('weeks').isInt().notEmpty(),
        body('tuition').isInt().notEmpty(),
        body('discount').isInt().notEmpty(),
        body('categories_id').isString().notEmpty().custom(value => {
            return Catagories.findOne({ _id: value }).then(category => {
                if (!category) {
                    return Promise.reject(`Category is not found with ${value}`)
                }
            })
        }),
        protect, authorize('teacher'), createCourseOfTeacher);
router.route('/courses/:courseId')
    .get(protect, authorize('teacher'), getCourseDetailOfTeacher)
    .post(body('is_published').isBoolean().notEmpty(),
        protect, authorize('teacher'), publishCourseOfTeacher)
    .put(
        body('title').isString().optional(),
        body('overview').isString().optional().isLength({ min: 10 }).withMessage('must be at least 10 chars long'),
        body('description').isString().optional().isLength({ min: 10 }).withMessage('must be at least 10 chars long'),
        body('minimum_skill').isString().optional(),
        body('weeks').isInt().optional(),
        body('tuition').isInt().optional(),
        body('discount').isInt().optional(),
        body('categories_id').isString().custom(value => {
            return Catagories.findOne({ _id: value }).then(category => {
                if (!category) {
                    return Promise.reject(`Category is not found with ${value}`)
                }
            })
        }).optional(),
        protect, authorize('teacher'), updateCourseOfTeacher
    )
module.exports = router;
