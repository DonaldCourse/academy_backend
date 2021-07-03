const crypto = require('crypto');
const path = require('path');
const asyncHandler = require('../middlewares/async');
const Students = require('../models/Students');
const Tutors = require('../models/Tutors');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');

// @desc POST register a user
// @route POST /api/v1/auth/register
// access PUBLIC
exports.register = asyncHandler(async (req, res, next) => {
    const { name, email, password, role } = req.body;

    const currentUser = await User.findOne({ email }).select('+password');

    if (currentUser) {
        return next(new ErrorResponse('The email registered', 400));
    }

    const user = await User.create({
        name,
        email,
        password,
    });

    await Students.create({
        user_id: user._id,
        name,
        email
    });

    const token = user.getSignedJwtToken();

    res.status(200).json({
        success: true,
        token,
        user: {
            role: user.role,
            email: user.email,
            name: user.name
        }
    });
});

// @desc POST register a user
// @route POST /api/v1/auth/tutor/register
// access PUBLIC
exports.registerTutor = asyncHandler(async (req, res, next) => {
    const { name, email, password } = req.body;

    const currentUser = await User.findOne({ email }).select('+password');

    if (currentUser) {
        return next(new ErrorResponse('The email registered', 400));
    }

    const user = await User.create({
        name,
        email,
        password,
        role : "teacher"
    });

    const tutor = await Tutors.create({
        user_id: user._id,
        name,
        email
    });

    res.status(200).json({
        success: true,
        tutor
    });
});

// @desc POST register a user
// @route POST /api/v1/auth/admin/register
// access PUBLIC
exports.registerAdmin = asyncHandler(async (req, res, next) => {
    const { name, email, password } = req.body;

    const currentUser = await User.findOne({ email }).select('+password');

    if (currentUser) {
        return next(new ErrorResponse('The email registered', 400));
    }

    const user = await User.create({
        name,
        email,
        password,
        role : "administrator"
    });

    res.status(200).json({
        success: true,
        user
    });
});

// @desc POST register a user
// @route POST /api/v1/auth/login
// access PUBLIC
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorResponse('Please provide an email and password', 400));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return next(new ErrorResponse('Invalid Credential', 401));
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        return next(new ErrorResponse('Invalid Credential', 401));
    }

    sendTokenResponse(user, 200, res);
});

const sendTokenResponse = (user, status, res) => {
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true
    }

    res.status(status).cookie('token', token, options).json({
        success: true,
        token,
        user: {
            role: user.role,
            email: user.email,
            name: user.name
        }
    });
}

// @desc POST logout a user
// @route POST /api/v1/auth/logout
// access PRIVATE
exports.logout = asyncHandler(async (req, res, next) => {
    const options = {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true
    }

    res.status(status).cookie('token', 'none', options).json({
        success: true
    });
});

// @desc POST forgot password
// @route POST /api/v1/auth/forgot
// access PUBLIC
exports.forgot = asyncHandler(async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return next(new ErrorResponse('Please provide an email', 400));
    }

    const user = User.findOne({ email: email });

    if (!user) {
        return next(new ErrorResponse(`There is no user with email ${email}`, 401));
    }

    const resetToken = user.resetTokenMethod();

    await user.save({ validateBeforeSave: false });

    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;

    const message = `Please make a PUT request to reset password : ${resetUrl}`

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password reset token',
            message
        });

        res.status(200).json({
            success: true,
            message: `Email sent to a email address ${user.email}`
        });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new ErrorResponse('Email could not be sent ', 500));

    }
});

// @desc POST reset password
// @route POST /api/v1/auth/resetpassword/:resettoken
// access PUBLIC
exports.resetpassword = asyncHandler(async (req, res, next) => {

    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: DataCue.now() }
    });

    if (!user) {
        return next(new ErrorResponse(`Invalid token`, 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordToken = undefined;

    await user.save();

    sendTokenResponse(user, 200, res);
});

exports.updateUserDetails = asyncHandler(async (req, res, next) => {
    let user = await User.findById(req.params.id);

    const fieldsUpdate = {
        email: req.body.email,
        name: req.body.name
    }

    if (!user) {
        return next(new ErrorResponse('Not exists user', 400));
    }

    user = await User.findOneAndUpdate(req.user.id, fieldsUpdate, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: user
    });
});

exports.updatePassword = asyncHandler(async (req, res, next) => {
    let user = await User.findById(req.user.id).select('+password');

    if (!(await user.matchPassword(req.body.currentPassword))) {
        return next(new ErrorResponse('Password is incorrect', 401));
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
});

// @desc POST validate-user
// @route POST /api/v1/auth/validate-user
// access PRIVATE
exports.validateUser = asyncHandler(async (req, res, next) => {

    const user = await User.findOne({ _id: req.user.id });

    res.status(200).json({
        success: true,
        user: {
            role: user.role,
            email: user.email,
            name: user.name
        }
    })
});