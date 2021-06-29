const { validationResult } = require('express-validator');
const asyncHandler = require('../middlewares/async');
const Catagories = require('../models/Categories');
const Courses = require('../models/Courses');
const Tutors = require('../models/Tutors');
const User = require('../models/User');
const Lessons = require('../models/Lessons');

const ErrorResponse = require('../utils/errorResponse')

/**
 * Group Teacher
 */
// @desc POST add a lesson to a course
// @route POST /api/v1/teacher/courses/:id/lessons
// access Private
exports.createLessonOfCourse = asyncHandler(async (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        res.status(422).json({
            success: false,
            errors: result.array()
        });
        return next();
    }
    const tutor = await Tutors.findOne({ user_id: req.user.id });
    const course = await Courses.findOne({ lecturer_id: tutor._id, _id: req.params.id });
    const lesson = await Lessons.create({
        title: req.body.title,
        thumbnail: req.body.thumbnail,
        video_url: req.body.video_url,
        course_id: course._id
    });

    if (!tutor) {
        return next(new ErrorResponse("Tutor not found,  Course not found", 400));
    }

    if (!course) {
        return next(new ErrorResponse("Tutor is not teaching course or Course not found", 400));
    }

    res.status(201).json({
        success: true,
        data: lesson
    });
});

/**
 * Group Teacher
 */
// @desc GET get all lesson of course
// @route GET /api/v1/teacher/courses/:id/lessons
// access Private
exports.getListLessonOfCourse = asyncHandler(async (req, res, next) => {
    const tutor = await Tutors.findOne({ user_id: req.user.id });
    const course = await Courses.findOne({ lecturer_id: tutor._id, _id: req.params.id });
    const lessons = await Lessons.find({ course_id: course._id });
    if (!tutor) {
        return next(new ErrorResponse("Tutor not found,  Course not found", 400));
    }

    if (!course) {
        return next(new ErrorResponse("Tutor is not teaching course or Course not found", 400));
    }

    res.status(201).json({
        success: true,
        data: lessons
    });
});

/**
 * Group Teacher
 */
// @desc PUT get all lesson of course
// @route PUT /api/v1/teacher/courses/:id/lessons/:lessonId
// access Private
exports.editListLessonOfCourse = asyncHandler(async (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        res.status(422).json({
            success: false,
            errors: result.array()
        });
        return next();
    }
    const tutor = await Tutors.findOne({ user_id: req.user.id });
    const course = await Courses.findOne({ lecturer_id: tutor._id, _id: req.params.id });
    let lesson = await Lessons.findOne({ _id: req.params.lessonId });
    if (!tutor) {
        return next(new ErrorResponse("Tutor not found,  Course not found", 400));
    }

    if (!course) {
        return next(new ErrorResponse("Tutor is not teaching course or Course not found", 400));
    }

    if (!lesson) {
        return next(new ErrorResponse("Lesson not found", 400));
    }

    lesson = await Lessons.findByIdAndUpdate(lesson._id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(201).json({
        success: true,
        data: lesson
    });
});

/**
 * Group Teacher
 */
// @desc DELETE remove a lesson of course
// @route DELETE /api/v1/teacher/courses/:id/lessons/:lessonId
// access Private
exports.deleteLessonOfCourse = asyncHandler(async (req, res, next) => {
    const tutor = await Tutors.findOne({ user_id: req.user.id });
    const course = await Courses.findOne({ lecturer_id: tutor._id, _id: req.params.id });
    let lesson = await Lessons.findOne({ _id: req.params.lessonId });

    if (!tutor) {
        return next(new ErrorResponse("Tutor not found,  Course not found", 400));
    }

    if (!course) {
        return next(new ErrorResponse("Tutor is not teaching course or Course not found", 400));
    }

    if (!lesson) {
        return next(new ErrorResponse("Lesson not found", 400));
    }

    lesson.remove();

    res.status(200).json({
        success: true,
        data: {}
    });
});


