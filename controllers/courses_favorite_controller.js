const { validationResult } = require('express-validator');
const asyncHandler = require('../middlewares/async');
const Courses = require('../models/Courses');
const Course_Favorite = require('../models/Course_Favorite');
const Students = require('../models/Students');
const { findAllCourseFavorite } = require('../services/courses_favorite_services');
const ErrorResponse = require('../utils/errorResponse');

// @desc POST add a courses to a bootcamp
// @route POST /api/courses/:id/favorite
// access Private 
exports.favoriteCourse = asyncHandler(async (req, res, next) => {
    const student = await Students.findOne({ user_id: req.user.id });
    const course = await Courses.findOne({ _id: req.params.id });
    if (!student || !course) {
        return next(new ErrorResponse("Student not found or Course not found", 400));
    }
    const registerOld = await Course_Favorite.findOne({ student_id: student._id, course_id: course._id });
    if (registerOld) {
        return next(new ErrorResponse("You registed a course ago", 400));
    }
    req.body.course_id = course._id;
    req.body.student_id = student._id;

    const favorite = await Course_Favorite.create(req.body);
    res.status(201).json({
        success: true,
        data: favorite
    });
});

// @desc POST add a courses to a bootcamp
// @route POST /api/courses/:id/favorite
// access Private 
exports.deleteFavoriteCourse = asyncHandler(async (req, res, next) => {
    const student = await Students.findOne({ user_id: req.user.id });
    const course = await Courses.findOne({ _id: req.params.id });
    if (!student || !course) {
        return next(new ErrorResponse("Student not found or Course not found", 400));
    }
    const favorite = await Course_Favorite.findOne({ student_id: student._id, course_id: course._id });
    if (!favorite) {
        return next(new ErrorResponse("Not found", 400));
    }

    favorite.remove();

    res.status(200).json({
        success: true,
        data: {}
    });
});


// @desc GET add a courses to a bootcamp
// @route GET /api/courses/:id/favorite
// access Private
exports.checkFavoriteCourse = asyncHandler(async (req, res, next) => {
    const student = await Students.findOne({ user_id: req.user.id });
    const course = await Courses.findOne({ _id: req.params.id });
    if (!student || !course) {
        return next(new ErrorResponse("Student not found or Course not found", 400));
    }
    const registerOld = await Course_Favorite.findOne({ student_id: student._id, course_id: course._id });
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

// @desc GET all my courses
// @route GET /api/courses/my-favorite-courses
// access Private
exports.getAllMyFavoriteCourse = asyncHandler(async (req, res, next) => {
    const student = await Students.findOne({ user_id: req.user.id });
    if (!student) {
        return next(new ErrorResponse("Student not found", 400));
    }
    const courses = await findAllCourseFavorite(req, { student_id: student._id })
    res.status(200).json({
        success: true,
        data: courses
    });
});
