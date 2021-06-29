const { validationResult } = require('express-validator');
const asyncHandler = require('../middlewares/async');
const Tutors = require('../models/Tutors');
const ErrorResponse = require('../utils/errorResponse');

/**
 * Group Teacher
 */
// @desc GET get all lesson of course
// @route GET /api/v1/teacher/:id/profile
// access Private
exports.getTutorProfile = asyncHandler(async (req, res, next) => {
    const tutor = await Tutors.findOne({ user_id: req.user.id });
    if (!tutor) {
        return next(new ErrorResponse("Tutor not found,  Course not found", 400));
    }

    res.status(201).json({
        success: true,
        data: tutor
    });
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
    let tutor = await Tutors.findOne({ user_id: req.user.id });

    if (!tutor) {
        return next(new ErrorResponse("Tutor not found", 400));
    }

    tutor = await Tutors.findByIdAndUpdate(tutor._id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(201).json({
        success: true,
        data: tutor
    });
});