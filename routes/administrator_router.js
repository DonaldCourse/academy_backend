const express = require('express');
const { protect, authorize } = require('../middlewares/auth');
const { body } = require('express-validator');
const { createCategories, findAllCategories, updateCategoriesOfAdmin, getCategoryDetail, findAllCategoriesOfAdmin } = require('../controllers/categories_controller');
const { getCoursesOfAdministrator, publishedCoursesOfAdministrator, updateCourseOfAdmin } = require('../controllers/courses_controller');
const { getListTutorOfAdmin } = require('../controllers/tutor_controller');
const { getListStudentOfAdmin } = require('../controllers/student_controller');


const router = express.Router();
const Catagories = require('../models/Categories');

router.route('/categories')
    .post(protect, authorize('administrator'), createCategories)
    .get(protect, authorize('administrator'), findAllCategoriesOfAdmin)

router.route('/categories/:categoryId')
    .get(protect, authorize('administrator'), getCategoryDetail)
    .put(body('name').isString().optional(),
        body('parent_id').isString().optional(),
        protect, authorize('administrator'), updateCategoriesOfAdmin)

router.route('/courses')
    .get(protect, authorize('administrator'), getCoursesOfAdministrator)

router.route('/courses/:courseId')
    .post(body('is_published').isBoolean().notEmpty(),
        protect, authorize('administrator'), publishedCoursesOfAdministrator)
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
        protect, authorize('administrator'), updateCourseOfAdmin
    )

router.route('/tutors')
    .get(protect, authorize('administrator'), getListTutorOfAdmin)

router.route('/students')
    .get(protect, authorize('administrator'), getListStudentOfAdmin)

module.exports = router;
