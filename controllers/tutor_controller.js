const { validationResult } = require('express-validator');
const asyncHandler = require('../middlewares/async');
const Tutors = require('../models/Tutors');
const ErrorResponse = require('../utils/errorResponse');
const TutorService = require('../services/tutors_service');
const User = require('../models/User');
/**
 * Group Admin
 */
// @desc GET get all lesson of course
// @route GET /api/admin/tutors
// access Private
exports.getListTutorOfAdmin = asyncHandler(async (req, res, next) => {
    const tutors = await TutorService.findAllTutor(req, null)
    res.status(200).json(tutors);
});

/**
 * Group Teacher
 */
// @desc GET get all lesson of course
// @route GET /api/v1/teacher/:id/profile
// access Private
exports.getTutorProfile = asyncHandler(async (req, res, next) => {
    const tutor = await Tutors.findOne({ user_id: req.user.id }).populate({ path: 'user_id', select: 'role name email avatar' });
    if (!tutor) {
        return next(new ErrorResponse("Tutor not found", 400));
    }
    res.status(200).json({
        success: true,
        user: {
            role: tutor.user_id.role,
            email: tutor.user_id.email,
            name: tutor.user_id.name,
            education: tutor.education ? tutor.education : "",
            avatar: tutor.user_id.avatar ? tutor.user_id.avatar : ""
        }
    })
});

/**
 * Group Teacher
 */
// @desc PUT get all lesson of course
// @route PUT /api/v1/teacher/:id/profile
// access Private
exports.updateTutorProfile = asyncHandler(async (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        res.status(422).json({
            success: false,
            errors: result.array()
        });
        return next();
    }

    let user = await User.findById(req.user.id);

    if (!user) {
        return next(new ErrorResponse('Not exists user', 400));
    }

    user = await User.findOneAndUpdate({ _id: user._id }, req.body, {
        new: true,
        runValidators: true
    });

    tutor = await Tutors.findOneAndUpdate({ user_id: user._id }, req.body, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        success: true,
        user: {
            role: user.role,
            email: user.email,
            name: user.name,
            education: tutor.education ? tutor.education : "",
            avatar: user.avatar ? user.avatar : ""
        }
    });
});
