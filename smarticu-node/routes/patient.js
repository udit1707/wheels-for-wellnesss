const express = require('express');
const router = express.Router();
const isAuth=require('../middleware/is-auth');

const patientController=require('../controllers/patient');

//verify OTP Login
router.get('/verifyLogin',patientController.verifyLogin);

//register a request
router.post('/register',patientController.postRequest);

//fetch Patient details-dashboard
router.get('/fetchDetails',isAuth.nonAdminAuth,patientController.fetchPatientInfo);

router.get('/fetchStatus',isAuth.nonAdminAuth,patientController.fetchStatus);

module.exports=router;