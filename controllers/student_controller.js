
const { validationResult } = require('express-validator');
const asyncHandler = require('../middlewares/async');
const ErrorResponse = require('../utils/errorResponse');
const StudentService = require('../services/students_service');
/**
 * Group Admin
 */
// @desc GET get all lesson of course
// @route GET /api/admin/students
// access Private
exports.getListStudentOfAdmin = asyncHandler(async (req, res, next) => {
    const tutors = await StudentService.findAllStudent(req, null)
    res.status(200).json(tutors);
});
