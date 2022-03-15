const express = require('express');
const router = express.Router();
const isAuth=require('../middleware/is-auth');

const ambulanceController=require('../controllers/ambulance');

router.get('/verifyLogin',ambulanceController.verifyLogin);

router.post('/register',ambulanceController.createAmbulance);

router.post('/available',isAuth.nonAdminAuth, ambulanceController.availableToPick);

router.post('/cancelRide',isAuth.nonAdminAuth,ambulanceController.cancelRide);

router.post('/rideCompleted',isAuth.nonAdminAuth,ambulanceController.rideCompleted);

router.post('/triggerAlgo',ambulanceController.triggerAlgo);

router.get('/fetchStatus',isAuth.nonAdminAuth,ambulanceController.fetchStatus);


module.exports=router;