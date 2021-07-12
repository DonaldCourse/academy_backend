const express = require('express');
const { body } = require('express-validator');
const { getCourses, getLessonOfCourse, getCourseDetail, getCourseOfWeek, getAllNewCourse, getCourseWatchMost, getCategoriesRegisterMost, getAllCourseRelated } = require('../controllers/courses_controller');
const { createCourseReview, getAllCourseReview } = require('../controllers/courses_review_controller');
const { registerCourse, getAllCourseRegisted, getAllMyCourse, checkRegisterCourse } = require('../controllers/courses_register_controller');
const { protect, authorize } = require('../middlewares/auth');
const router = express.Router({ mergeParams: true });

// get three course of week
router.route('/coursesOfWeek')
    .get(getCourseOfWeek);
// get ten course watch most
router.route('/coursesWatchMost')
    .get(getCourseWatchMost);
// get ten new course
router.route('/coursesNew')
    .get(getAllNewCourse);
// get category registed most
router.route('/categoriesRegisterMost')
    .get(getCategoriesRegisterMost);
router.route('/my-courses')
    .get(protect, authorize("student"), getAllMyCourse);
router.route('/')
    .get(getCourses);
router.route('/:id')
    .get(getCourseDetail);
router.route('/:id/lessons')
    .get(protect, authorize("student"), getLessonOfCourse);
router.route('/:id/related')
    .get(getAllCourseRelated);
router.route('/:id/register')
    .post(protect, authorize("student"), registerCourse);
router.route('/:id/check')
    .get(protect, authorize("student"), checkRegisterCourse);
router.route('/:id/feedback')
    .get(getAllCourseReview)
    .post(body('title').isString().notEmpty(),
        body('rating').isFloat({ min: 1, max: 5 }),
        protect, authorize('student'), createCourseReview);
module.exports = router;
