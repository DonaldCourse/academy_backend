const { validationResult } = require('express-validator');
const asyncHandler = require('../middlewares/async');
const Categories = require('../models/Categories');
const Catagories = require('../models/Categories');
const Courses = require('../models/Courses');
const Lessons = require('../models/Lessons');
const Tutors = require('../models/Tutors');
const User = require('../models/User');

const { findAllCourses, SearchCourses, SearchCategories } = require('../services/courses_service');

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
        return next(new ErrorResponse("Tutor not found", 400));
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
        return next(new ErrorResponse("Tutor not found", 400));
    }
    if (req.query.categoriesId) {
        const courses = await findAllCourses(req, { categories_id: req.query.categoriesId, lecturer_id: tutor._id });
        res.status(200).json({
            success: true,
            data: courses
        });
    } else {
        const data = await findAllCourses(req, { lecturer_id: tutor._id })
        res.status(200).json(data);
    }
});

// @desc GET courses
// @route GET /api/v1/teacher/courses/:courseId
// access Private
exports.getCourseDetailOfTeacher = asyncHandler(async (req, res, next) => {
    const tutor = await Tutors.findOne({ user_id: req.user.id })
    if (!tutor) {
        return next(new ErrorResponse("Tutor not found", 400));
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

/**
 * Group Admin
 */
// @desc GET courses
// @route GET /api/v1/courses
// @route GET /api/v1/admin/courses?categoriesId=
// access PUBLIC
exports.getCoursesOfAdministrator = asyncHandler(async (req, res, next) => {
    if (req.query.categoriesId) {
        const data = await findAllCourses(req, { categories_id: req.query.categoriesId });
        res.status(200).json(data);
    } else {
        const data = await findAllCourses(req, null);
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
// @route GET /api/courses/:id
// access PUBLIC
exports.getCourses = asyncHandler(async (req, res, next) => {
    if (req.query.categoriesId) {
        const result = await Catagories.find({ "ancestors._id": req.query.categoriesId })
            .select({ "_id": true })
            .exec();
        let categories = [];
        JSON.parse(JSON.stringify(result)).map(item => {
            return categories.push({ categories_id: item._id })
        });
        categories.push({ categories_id: req.query.categoriesId });
        const courses = await findAllCourses(req, { $or: categories, is_published: true });
        res.status(200).json({
            success: true,
            data: courses
        });
    } else {
        const data = await findAllCourses(req, { is_published: true })
        res.status(200).json(data);
    }
});

// @desc GET courses
// @route GET /api/v1/courses
// @route GET /api/courses/:id/lessons
// access PUBLIC
exports.getLessonOfCourse = asyncHandler(async (req, res, next) => {
    const course = await Courses.findOne({ _id: req.params.id, is_published: true }).populate({ path: 'lecturer_id', select: '_id name' });
    if (!course) {
        return next(new ErrorResponse(`Course isn't exists`, 404));
    }
    const lessons = await Lessons.find({ course_id: course._id });
    res.status(200).json({
        success: true,
        data: {
            course: course,
            lessons: lessons
        }
    });
});

// @desc GET courses
// @route GET /api/v1/courses
// @route GET /api/courses/:id
// access PUBLIC
exports.getCourseDetail = asyncHandler(async (req, res, next) => {
    const course = await Courses.findOne({ _id: req.params.id, is_published: true })
        .populate({ path: 'lecturer_id', populate: { path: 'user_id', select: 'name email avatar' } });
    if (!course) {
        return next(new ErrorResponse(`Course isn't exists`, 404));
    }
    const lessons = await Lessons.find({ course_id: course._id }).limit(3);
    res.status(200).json({
        success: true,
        data: {
            course: course,
            lessons: lessons
        }
    });
});

exports.getCourseOfWeek = asyncHandler(async (req, res, next) => {
    const courses = await Courses.find({ is_published: true })
        .populate({ path: 'lecturer_id', populate: { path: 'user_id', select: 'name email avatar' } })
        .sort({ created_at: -1, count_watch: -1, count_register: -1 })
        .limit(3);

    res.status(200).json({
        success: true,
        data: courses
    });

});

exports.getCourseWatchMost = asyncHandler(async (req, res, next) => {
    const courses = await Courses.find({ is_published: true })
        .populate({ path: 'lecturer_id', populate: { path: 'user_id', select: 'name email avatar' } })
        .sort({ count_watch: -1 })
        .limit(10);

    res.status(200).json({
        success: true,
        data: courses
    });
});

exports.getAllNewCourse = asyncHandler(async (req, res, next) => {
    const courses = await Courses.find({ is_published: true })
        .populate({ path: 'lecturer_id', populate: { path: 'user_id', select: 'name email avatar' } })
        .sort({ created_at: -1 })
        .limit(10)

    res.status(200).json({
        success: true,
        data: courses
    });
});

exports.getCategoriesRegisterMost = asyncHandler(async (req, res, next) => {
    const aggregatorOpts = [
        {
            $group: {
                _id: "$categories_id",
                count_register: { $sum: "$count_register" }
            },
        },
        { $limit: 4 }
    ]

    const courses = await Courses.aggregate(aggregatorOpts).exec();
    let ids = courses.map(ele => ele._id);
    console.log(ids);
    const categories = await Categories.find({ '_id': { $in: ids } });
    console.log(categories);
    // const courses = await Courses.find({ is_published: true })
    //     .populate({ path: 'categories_id', select: '_id name' })
    //     .sort({ count_register: -1 })
    //     .limit(10);

    res.status(200).json({
        success: true,
        data: categories
    });
});

exports.getAllCourseRelated = asyncHandler(async (req, res, next) => {
    const course = await Courses.findOne({ _id: req.params.id, is_published: true });
    if (!course) {
        return next(new ErrorResponse(`Course isn't exists`, 404));
    }

    const courses = await Courses.find({ categories_id: course.categories_id, _id: { $ne: course._id } }).populate({
        path: 'lecturer_id',
        populate: { path: 'user_id', select: 'name email avatar' }
    }).limit(5);

    res.status(200).json({
        success: true,
        data: courses
    });
});

// @desc GET courses
// @route GET /api/v1/courses
// @route GET /api/courses/search?q=jfjfj&sort=
// access PUBLIC
exports.searchCourse = asyncHandler(async (req, res, next) => {
    const courses = await SearchCourses(req);
    console.log(courses);
    res.status(200).json({
        success: true,
        data: {
            courses,
        }
    });
});

// @desc GET courses
// @route GET /api/v1/courses
// @route GET /api/categories/search?q=jfjfj&sort=
// access PUBLIC
exports.searchCategories = asyncHandler(async (req, res, next) => {
    const categories = await SearchCategories(req);
    res.status(200).json({
        success: true,
        data: {
            categories
        }
    });
});
