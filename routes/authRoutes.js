const express = require('express');
const router = express.Router();
const { login, verifyOtp, changePassword, resendOtp } = require('../controllers/authController');

router.post('/login', login);
router.post('/verify-otp', verifyOtp);
router.post('/change-password', changePassword);
router.post('/resend-otp', resendOtp);

module.exports = router;
