const express = require('express');
const { body } = require('express-validator');
const { register, login, forgot, resetpassword, updateUserDetails, updatePassword, logout, registerTutor, validateUser, registerAdmin, validateNewAccount } = require('../controllers/auth_controller');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.route('/register')
    .post(body('name').isString().notEmpty(),
        body("email").isEmail().notEmpty(),
        body('password').isString().notEmpty(),
        register);

router.route('/tutor/register')
    .post(protect, authorize('administrator'), registerTutor);

router.route('/admin/register')
    .post(registerAdmin);

router.route('/login')
    .post(login);

router.route('/logout')
    .get(logout);

router.route('/forgotpassword')
    .post(forgot);

router.route('/resetpassword')
    .post(resetpassword);

router.route('/validate-account')
    .get(validateNewAccount);

router.route('/updatedetails')
    .post(protect, updateUserDetails);

router.route('/updatepassword')
    .post(body("currentPassword").isString().notEmpty(),
        body('password').isString().notEmpty(), 
        protect, updatePassword);

router.route('/validate-user')
    .get(protect, validateUser);

module.exports = router;
