const { validationResult } = require('express-validator');
const asyncHandler = require('../middlewares/async');
const Categories = require('../models/Categories');
const Catagories = require('../models/Categories');
const Courses = require('../models/Courses');
const Course_Review = require('../models/Course_Review');
const Lessons = require('../models/Lessons');
const Students = require('../models/Students');
const Tutors = require('../models/Tutors');
const User = require('../models/User');
const { findAllCourseReview } = require('../services/courses_review_service');
const ErrorResponse = require('../utils/errorResponse')

// @desc POST add a courses to a bootcamp
// @route POST /api/course/:id/feedback
// access Private
exports.createCourseReview = asyncHandler(async (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        res.status(422).json({
            success: false,
            errors: result.array()
        });
    }
    const student = await Students.findOne({ user_id: req.user.id });
    const course = await Courses.findOne({ _id: req.params.id });
    if (!student || !course) {
        return next(new ErrorResponse("Student not found or Course not found", 400));
    }
    const reviewOld = await Course_Review.findOne({ student_id: student._id });
    if (reviewOld) {
        return next(new ErrorResponse("You sent a feedback for our ago", 400));
    }
    req.body.course_id = course._id;
    req.body.student_id = student._id;

    const review = await Course_Review.create(req.body);
    res.status(201).json({
        success: true,
        data: review
    });
});

// @desc GET add a courses to a bootcamp
// @route GET /api/course/:id/feedback
// access Private
exports.getAllCourseReview = asyncHandler(async (req, res, next) => {
    const reviews = await findAllCourseReview(req, { course_id: req.params.id })
    res.status(200).json({
        success: true,
        data: reviews
    });
});
