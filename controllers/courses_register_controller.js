const { validationResult } = require('express-validator');
const asyncHandler = require('../middlewares/async');
const Categories = require('../models/Categories');
const Catagories = require('../models/Categories');
const Courses = require('../models/Courses');
const Course_Register = require('../models/Course_Register');
const Course_Review = require('../models/Course_Review');
const Lessons = require('../models/Lessons');
const Students = require('../models/Students');
const Tutors = require('../models/Tutors');
const User = require('../models/User');
const { findAllCourseRegister } = require('../services/courses_register_service');
const { findAllCourseReview } = require('../services/courses_review_service');
const ErrorResponse = require('../utils/errorResponse')

// @desc POST add a courses to a bootcamp
// @route POST /api/courses/:id/register
// access Private
exports.registerCourse = asyncHandler(async (req, res, next) => {
    const student = await Students.findOne({ user_id: req.user.id });
    const course = await Courses.findOne({ _id: req.params.id });
    if (!student || !course) {
        return next(new ErrorResponse("Student not found or Course not found", 400));
    }
    const registerOld = await Course_Register.findOne({ student_id: student._id, course_id: course._id });
    if (registerOld) {
        return next(new ErrorResponse("You registed a course ago", 400));
    }
    req.body.course_id = course._id;
    req.body.student_id = student._id;

    const review = await Course_Register.create(req.body);
    res.status(201).json({
        success: true,
        data: review
    });
});

// @desc GET add a courses to a bootcamp
// @route GET /api/courses/:id/check
// access Private
exports.checkRegisterCourse = asyncHandler(async (req, res, next) => {
    const student = await Students.findOne({ user_id: req.user.id });
    const course = await Courses.findOne({ _id: req.params.id });
    if (!student || !course) {
        return next(new ErrorResponse("Student not found or Course not found", 400));
    }
    const registerOld = await Course_Register.findOne({ student_id: student._id, course_id: course._id });
    if (registerOld) {
        res.status(200).json({
            success: true,
            data: true
        });
    } else {
        res.status(200).json({
            success: true,
            data: false
        });
    }
});

// @desc GET add a courses to a bootcamp
// @route GET /api/courses/registed
// access Private
exports.getAllCourseRegisted = asyncHandler(async (req, res, next) => {
    const reviews = await findAllCourseRegister(req, null)
    res.status(200).json({
        success: true,
        data: reviews
    });
});

// @desc GET all my courses
// @route GET /api/courses/my-courses
// access Private
exports.getAllMyCourse = asyncHandler(async (req, res, next) => {
    const student = await Students.findOne({ user_id: req.user.id });
    if (!student) {
        return next(new ErrorResponse("Student not found", 400));
    }
    const courses = await findAllCourseRegister(req, { student_id: student._id })
    res.status(200).json({
        success: true,
        data: courses
    });
});
