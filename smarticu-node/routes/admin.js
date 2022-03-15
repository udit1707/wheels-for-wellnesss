const express = require('express');
const router = express.Router();
const isAuth=require('../middleware/is-auth');

const adminController=require('../controllers/admin');

// router.get('/hospitals',adminController.getHospital);

router.post('/signup',adminController.createAdmin);

router.post('/login',adminController.loginAdmin);

router.post('/modifyBeds',isAuth.adminAuth,adminController.postBedsAvailable);

router.get('/bedsAvailable',isAuth.adminAuth,adminController.fetchBeds);

router.get('/myHospital',isAuth.adminAuth,adminController.fetchHospital);

router.get('/getRecords/:hosId',isAuth.adminAuth,adminController.fetchPatAdmitted);

router.get('/getAdmissionCount/:hosId',isAuth.adminAuth,adminController.fetchCount);

router.get('/isCodeRed',isAuth.adminAuth,adminController.fetchCodeRed);

router.get('/pieStats/:hosId',isAuth.adminAuth,adminController.pieGenderSeverity);


module.exports=router;