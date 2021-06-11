const express = require('express');
const { register, login, forgot, resetpassword, updateUserDetails, updatePassword, logout } = require('../controllers/auth_controller');
const { protect } = require('../middlewares/auth');
const router = express.Router();

router.route('/register')
    .post(register);

router.route('/login')
    .post(login);

router.route('/logout')
    .get(logout);

router.route('/forgotpassword')
    .post(forgot);

router.route('/resetpassword/:resettoken')
    .put(resetpassword);

router.route('/updatedetails')
    .post(protect, updateUserDetails);

router.route('/updatepassword')
    .post(protect, updatePassword);

module.exports = router;
