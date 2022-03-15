const express = require('express');
const router = express.Router();

const miscController=require('../controllers/misc');

router.get('/hospitals',miscController.getHospital);

router.post('/newHospital',miscController.regHospi);

module.exports=router;
