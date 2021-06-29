const { validationResult } = require('express-validator');
const asyncHandler = require('../middlewares/async');
const Catagories = require('../models/Categories');
const Courses = require('../models/Courses');
const Tutors = require('../models/Tutors');
const User = require('../models/User');

const { findAllCourses } = require('../services/courses_service');

const ErrorResponse = require('../utils/errorResponse')

/**
 * Group Teacher
 */
// @desc POST add a courses to a bootcamp
// @route POST /api/v1/teacher/courses
// access Private
exports.createCourseOfTeacher = asyncHandler(async (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        res.status(422).json({
            success: false,
            errors: result.array()
        });
    }
    const tutor = await Tutors.findOne({ user_id: req.user.id })
    if (!tutor) {
        return new ErrorResponse("Tutor not found", 400);
    }
    req.body.lecturer_id = tutor._id;
    const course = await Courses.create(req.body);
    res.status(201).json({
        success: true,
        data: course
    });
});

// @desc GET courses
// @route GET /api/v1/teacher/courses?categoriesId=
// access Private
exports.getCourseOfTeacher = asyncHandler(async (req, res, next) => {
    const tutor = await Tutors.findOne({ user_id: req.user.id })
    if (!tutor) {
        return new ErrorResponse("Tutor not found", 400);
    }
    if (req.query.categoriesId) {
        const courses = await findAllCourses(req, null, { categories_id: req.query.categoriesId, lecturer_id: tutor._id });
        res.status(200).json({
            success: true,
            data: courses
        });
    } else {
        const data = await findAllCourses(req, null, { lecturer_id: tutor._id })
        res.status(200).json(data);
    }
});

// @desc GET courses
// @route GET /api/v1/teacher/courses/:courseId
// access Private
exports.getCourseDetailOfTeacher = asyncHandler(async (req, res, next) => {
    const tutor = await Tutors.findOne({ user_id: req.user.id })
    if (!tutor) {
        return new ErrorResponse("Tutor not found", 400);
    }
    const courses = await Courses.findOne({ lecturer_id: tutor._id, _id: req.params.courseId });
    res.status(200).json({
        success: true,
        data: courses
    });
});


// @desc POST courses
// @route POST /api/v1/teacher/courses/:courseId
// access Private
exports.publishCourseOfTeacher = asyncHandler(async (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        res.status(422).json({
            success: false,
            errors: result.array()
        });
    }

    const { is_published } = req.body
    const tutor = await Tutors.findOne({ user_id: req.user.id })
    if (!tutor) {
        return new ErrorResponse("Tutor not found", 400);
    }
    let course = await Courses.findOne({ lecturer_id: tutor._id, _id: req.params.courseId });
    const isPublished = course.is_published
    if (!course) {
        return next(new ErrorResponse(`Course isn't exists`, 404));
    } else {
        if (isPublished == is_published) {
            return next(new ErrorResponse(`Please check status of course`, 404));
        }
    }
    course = await Courses.findByIdAndUpdate(course._id, { is_published: is_published }, {
        new: true,
        runValidators: true
    })
    res.status(200).json({
        success: true,
        data: course
    });
});


// @desc PUT courses of teacher
// @route PUT /api/v1/teacher/courses/:courseId
// access Private
exports.updateCourseOfTeacher = asyncHandler(async (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        res.status(422).json({
            success: false,
            errors: result.array()
        });
    }
    const tutor = await Tutors.findOne({ user_id: req.user.id })
    if (!tutor) {
        return new ErrorResponse("Tutor not found", 400);
    }
    let course = await Courses.findOne({ lecturer_id: tutor._id, _id: req.params.courseId });
    if (!course) {
        return next(new ErrorResponse(`Course isn't exists`, 404));
    }

    course = await Courses.findByIdAndUpdate(course._id, req.body, {
        new: true,
        runValidators: true
    })
    res.status(200).json({
        success: true,
        data: course
    });
});

// @desc GET courses
// @route GET /api/v1/courses
// @route GET /api/v1/admin/courses?categoriesId=
// access PUBLIC
exports.getCoursesOfAdministrator = asyncHandler(async (req, res, next) => {
    if (req.query.categoriesId) {
        const data = await findAllCourses(req, null, { categories_id: req.query.categoriesId });
        res.status(200).json({
            success: true,
            data: data
        });
    } else {
        const data = await findAllCourses(req, null, null);
        res.status(200).json(data);
    }
});

// @desc POST courses
// @route POST /api/v1/courses
// @route POST /api/v1/admin/courses/:courseId
// access PUBLIC
exports.publishedCoursesOfAdministrator = asyncHandler(async (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        res.status(422).json({
            success: false,
            errors: result.array()
        });
    }

    const { is_published } = req.body
    let course = await Courses.findOne({ _id: req.params.courseId });
    const isPublished = course.is_published
    if (!course) {
        return next(new ErrorResponse(`Course isn't exists`, 404));
    } else {
        if (isPublished == is_published) {
            return next(new ErrorResponse(`Please check status of course`, 404));
        }
    }
    course = await Courses.findByIdAndUpdate(course._id, { is_published: is_published }, {
        new: true,
        runValidators: true
    })
    res.status(200).json({
        success: true,
        data: course
    });
});

// @desc PUT courses of teacher
// @route PUT /api/v1/admin/courses/:courseId
// access Private
exports.updateCourseOfAdmin = asyncHandler(async (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        res.status(422).json({
            success: false,
            errors: result.array()
        });
    }

    let course = await Courses.findOne({ _id: req.params.courseId });
    if (!course) {
        return next(new ErrorResponse(`Course isn't exists`, 404));
    }

    course = await Courses.findByIdAndUpdate(course._id, req.body, {
        new: true,
        runValidators: true
    })
    res.status(200).json({
        success: true,
        data: course
    });
});

// @desc GET courses
// @route GET /api/v1/courses
// @route GET /api/v1/:categoriesId/courses
// access PUBLIC
exports.getCourses = asyncHandler(async (req, res, next) => {
    if (req.params.categoriesId) {
        const courses = await Courses.find({ categories: req.params.categoriesId });
        res.status(200).json({
            success: true,
            data: courses
        });
    } else {
        res.status(200).json(res.advacedResults);
    }
});

// @desc POST add a courses to a bootcamp
// @route GET /api/v1/categories/:categoriesId/courses
// access PUBLIC
exports.createCourse = asyncHandler(async (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        res.status(422).json({
            success: false,
            errors: result.array()
        });
    }
    if (req.user.role == 'administrator') {
        if (!req.body.lecturer_id) {
            return next(new ErrorResponse(`Please assignment to a teacher`, 404));
        } else {
            const user = await User.findById(req.body.lecturer_id);
            if (!user || user.role != 'teacher') {
                return next(new ErrorResponse(`Please assignment to a teacher`, 404));
            }
        }
        req.body.lecturer_id = req.body.lecturer_id;
    } else {
        req.body.lecturer_id = req.user.id;
    }
    req.body.categories_id = req.params.categoriesId;
    req.body.owner_id = req.user.id;
    const catagory = await Catagories.findById(req.params.categoriesId);
    if (!catagory) {
        return next(new ErrorResponse(`Not found a category with id of ${req.params.categoriesId}`, 404));
    }
    const course = await Courses.create(req.body);
    res.status(201).json({
        success: true,
        data: course
    });
});

exports.updateCourse = asyncHandler(async (req, res, next) => {

})
