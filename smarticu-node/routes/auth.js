const express = require('express');
const router = express.Router();
const authController=require('../controllers/auth');
const rateLimit=require('../middleware/rateLimit');

router.get('/getOTP',rateLimit,authController.getCode);

router.get('/verifyOTP',authController.verifyCode);

module.exports=router;