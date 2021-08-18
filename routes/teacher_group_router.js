const express = require('express');
const { protect, authorize } = require('../middlewares/auth');
const { body } = require('express-validator');
const Categories = require('../models/Categories');
const { createCourseOfTeacher, getCourseOfTeacher, getCourseDetailOfTeacher, publishCourseOfTeacher, updateCourseOfTeacher } = require('../controllers/courses_controller');
const { createLessonOfCourse, getListLessonOfCourse, editListLessonOfCourse, deleteLessonOfCourse } = require('../controllers/lesson_controller');
const { getTutorProfile, updateTutorProfile } = require('../controllers/tutor_controller');
const { findAllCategoriesOfTeacher } = require('../controllers/categories_controller');

const Courses = require('../models/Courses');
const router = express.Router();

router.route('/categories')
    .get(protect, authorize('teacher'), findAllCategoriesOfTeacher)
router.route('/courses')
    .get(protect, authorize('teacher'), getCourseOfTeacher)
    .post(body('title').isString().notEmpty(),
        body('overview').isString().notEmpty().isLength({ min: 10 }),
        body('description').isString().notEmpty().isLength({ min: 10 }),
        body('minimum_skill').isString().notEmpty(),
        body('weeks').isInt().optional(),
        body('tuition').isInt().optional(),
        body('discount').isInt().optional(),
        body('avatar').isString().notEmpty(),
        body('categories_id').isString().notEmpty().custom(value => {
            return Categories.findOne({ _id: value }).then(category => {
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
        body('avatar').isString().optional(),
        body('categories_id').isString().optional().custom(value => {
            return Categories.findOne({ _id: value }).then(category => {
                if (!category) {
                    return Promise.reject(`Category is not found with ${value}`)
                }
            })
        }).optional(),
        protect, authorize('teacher'), updateCourseOfTeacher
    )

router.route('/courses/:id/lessons')
    .get(protect, authorize('teacher'), getListLessonOfCourse)
    .post(body('title').isString().notEmpty(),
        body('thumbnail').isString().notEmpty(),
        body('video_url').isString().notEmpty(),
        protect, authorize('teacher'), createLessonOfCourse)

router.route('/courses/:id/lessons/:lessonId')
    .put(body('title').isString().optional(),
        body('thumbnail').isString().optional(),
        body('video_url').isString().optional(),
        body('course_id').isString().notEmpty().optional(),
        protect, authorize('teacher'), editListLessonOfCourse)
    .delete(protect, authorize('teacher'), deleteLessonOfCourse)

router.route('/profile')
    .get(protect, authorize('teacher'), getTutorProfile)
    .put(body('name').isString().optional(),
        body('email').isEmail().optional(),
        body('education').isString().optional(),
        protect, authorize('teacher'), updateTutorProfile)

module.exports = router;
