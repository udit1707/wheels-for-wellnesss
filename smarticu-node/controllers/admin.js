const Hospital = require("../models/hospital");
const Admin=require("../models/admin");
const User=require('../models/user');
// const rateLimitMiddleware = require("../middleware/rateLimit");
// const { Error } = require("sequelize/types");
const io = require('../socket');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const DailyAdmission = require("../models/dailyAdmission");
const moment=require('moment');
const PatientAmbu = require('../models/patientAmbu');
const Patient = require("../models/patient");
const Ambulance = require("../models/ambulance");
const { arrival_time } = require("google-distance-matrix");
const socket = require("../socket");





/***********************************Create a hospital Admin *******************************************************/
exports.createAdmin=async(req,res,next)=>{
    const portal_id=req.body.portalId;
    const first_name=req.body.firstName;
    const last_name=req.body.lastName;
    const password=req.body.password;
    const phone=req.body.phone;
    const hospitalId=req.body.hospitalId;
    try
    {
        const existingAdmin=await Admin.findOne({where:{portal_id:portal_id},attributes:['id','portal_id']});
        if(existingAdmin)
        {
          const error = new Error(`"Portal ID" exists. Select a unique ID`);
          error.statusCode = 401;
          throw error;
        }
        const foundHospital=await Hospital.findByPk(hospitalId,{attributes:['id','hospital_name']});
        if(!foundHospital)
        {
            const error = new Error(`Hospital does not Exist!`);
          error.statusCode = 404;
          throw error;
        }
        const hashedPwd=await bcrypt.hash(password,12);
        const newUser=await User.create({first_name:first_name,last_name:last_name,role:'Admin',phone:phone});
        const newAdmin=await newUser.createAdmin({portal_id:portal_id,password:hashedPwd,first_name:first_name,last_name:last_name,phone:phone,hospital_name:foundHospital.hospital_name});
        await foundHospital.addAdmin(newAdmin);
        res.status(200).json({message:"Admin Created!"});
    }
    catch(err)
    {
        if(!err.statusCode)
        {
            err.statusCode=500;
        }
        next(err);
    }
}

/*****************************************Admin Login ****************************************************************/
exports.loginAdmin=async(req,res,next)=>{
    const portal_id=req.body.portalId;
    const password=req.body.password;
    try
    {
        const admin=await Admin.findOne({where:{portal_id:portal_id},attributes:['id','portal_id','password']});
        if (!admin) 
        {
          const error = new Error('Admin with this portal Id could not be found.');
          error.statusCode = 401;
          throw error;
        }
        const isEqual=await bcrypt.compare(password,admin.password);  
        if (!isEqual)
        {
          const error = new Error('Wrong password!');
          error.statusCode = 401;
          throw error;
        }
        const token=jwt.sign({portalId:portal_id,userId:admin.id,role:'Admin'},'somesupersecretsecret',{expiresIn:'1440m'});
        // const refreshToken=jwt.sign({ kID:user.k_PID,userId:user.id,role:user.role},'somesuperrefreshsecretsecret',{expiresIn:'3600m'});
       
        res.status(200).json({message:"Login Success",token:token,userId:admin.id,role:'Admin'});
    }
    catch(err)
    {
        if(!err.statusCode)
        {
            err.statusCode=500;
        }
        next(err);
    }
}

/*****************************************Admin Post Beds Availability ***********************************************/
exports.postBedsAvailable=async(req,res,next)=>{
    const beds_available=+req.body.beds;
    const hospitalId=req.body.hospitalId;
    try
    {
        const foundAdmin=await Admin.findOne({where:{id:req.userId,hospitalId:hospitalId},attributes:['id','hospitalId']});
        if(!foundAdmin)
        {
            const error=new Error("Admin for this hospital not found");
            error.statusCode=404;
            throw error;
        }
        const foundHospital=await Hospital.findByPk(hospitalId,{attributes:['id','beds_available']});
        if(!foundHospital)
        {
          const error = new Error('Hospital not found.');
          error.statusCode = 404;
          throw error;
        }
        foundHospital.beds_available=beds_available;
        await foundHospital.save();
        const admins=await foundHospital.getAdmins({attributes:['id']});
        let adminId=[];
        for(let i=0;i<admins.length;i++)
        adminId.push(admins[i].id);
        io.getIO().emit('bedCount', {
            beds:beds_available,
            admins:adminId
          });
        res.status(200).json({message:"Beds Updated"});
    }

    // const socket = openSocket('https://health-express.herokuapp.com');

    // socket.on('bedCount',data=>{
    //     let x=id // id of the currently logged in admin
    //           if( id in data.admins )
    //         {
    //           this.updateCount();
    //         }
    // });


    catch(err)
    {
        if(!err.statusCode)
        {
            err.statusCode=500;
        }
        next(err);
    }
}

/******************************************Admin Fetch Current Beds Available ****************************************/
exports.fetchBeds=async(req,res,next)=>{
    try
    {
        const foundAdmin=await Admin.findByPk(req.userId,{attributes:['id','hospitalId']});
        if(!foundAdmin)
        {
            const error=new Error("Admin not found");
            error.statusCode=404;
            throw error;
        }
        const hospital=await Hospital.findByPk(foundAdmin.hospitalId,{attributes:['id','beds_available']});
        res.status(200).json({message:"Beds Fetched",hospital:hospital});
    }
    catch(err)
    {
        if(!err.statusCode)
        {
            err.statusCode=500;
        }
        next(err);
    }
}



/*****************************************Admin Fetch Hospital Details ***********************************************/
exports.fetchHospital=async(req,res,next)=>{
    try{       
        const foundAdmin=await Admin.findByPk(req.userId,{attributes:['id','hospitalId']});
        if(!foundAdmin)
        {
            const error=new Error("Admin not found");
            error.statusCode=404;
            throw error;
        }
        const hospital=await Hospital.findByPk(foundAdmin.hospitalId,{attributes:['id','hospital_name','phone','street_address']});
        res.status(200).json({message:"Hospital Fetched",hospital:hospital});
    }
    catch(err)
    {
        if(!err.statusCode)
        {
            err.statusCode=500;
        }
        next(err);
    }
}

/***************************************Fetch Patients served Today ***********************************************/

//Socket Can be Used!
exports.fetchPatAdmitted=async(req,res,next)=>{
    let dated=req.query.date||null;
    const hospitalId=req.params.hosId;
    try
    {
        let date=new Date();
        date=moment(date.toISOString()).format('YYYY-MM-DD');
        if(!dated)
        {
           dated=date; 
        }
        const foundAdmin=await Admin.findOne({where:{id:req.userId,hospitalId:hospitalId},attributes:['id','hospitalId']});
        if(!foundAdmin)
        {
            const error=new Error("Admin not found for this hospital");
            error.statusCode=404;
            throw error;
        }
        const foundRecord=await PatientAmbu.findAll({where:{hospitalId:hospitalId,dated:dated}});let obj={},resu=[];
        if(foundRecord.length==0)
        {
          const error = new Error('Records not found.');
          error.statusCode = 404;
          throw error;
        }
        for(let i=0;i<foundRecord.length;i++)
        {
            let el=foundRecord[i];
            const foundPat=await Patient.findByPk(el.patientId,{attributes:['id','first_name','last_name']});
            const foundAmb=await Ambulance.findByPk(el.ambulanceId,{attributes:['id','driver_phone']});
            obj['patient']=foundPat;
            obj['ambulance']=foundAmb;
            resu.push(obj);
            obj={};
        }
        //const foundRecord=await DailyAdmission.findAll({where:{hospitalId:hospitalId,dated:dated},attributes:['id','beds_available','dated','hospital_id','patients_served']});
       // console.log(resu);
        res.status(200).json({message:"Records Fetched",stats:resu});
    }
    catch(err)
    {
        if(!err.statusCode)
        {
            err.statusCode=500;
        }
        next(err);
    }
}
exports.fetchCount=async(req,res,next)=>{
    let dated=req.query.date||null;
    const hospitalId=req.params.hosId;
    try
    {
        let date=new Date();
        date=moment(date.toISOString()).format('YYYY-MM-DD');
        if(!dated)
        {
           dated=date; 
        }
        const foundAdmin=await Admin.findOne({where:{id:req.userId,hospitalId:hospitalId},attributes:['id','hospitalId']});
        if(!foundAdmin)
        {
            const error=new Error("Admin not found for this hospital");
            error.statusCode=404;
            throw error;
        }
        const fetchCount=await DailyAdmission.findOne({where:{hospitalId:hospitalId,dated:dated},attributes:['id','count','dated','hospitalId']});
        //console.log(fetchCount);
        let count;
        if(!fetchCount)
        count=0;
        else
        count=fetchCount.count;
        res.status(200).json({message:"Daily Count Fetched",count:count});
    }
    catch(err)
    {
        if(!err.statusCode)
        {
            err.statusCode=500;
        }
        next(err);
    }
}

/***********************Fetch Code Red ***************************************/

exports.fetchCodeRed=async(req,res,next)=>{

    try
    {
        const foundAdmin=await Admin.findByPk(req.userId,{attributes:['id','hospitalId']});
        if(!foundAdmin)
        {
            const error=new Error("Admin not found");
            error.statusCode=404;
            throw error;
        }
        const hospital=await Hospital.findByPk(foundAdmin.hospitalId,{attributes:['id','code_red']});
        res.status(200).json({message:"Warning Message Update",codeRed:hospital.code_red});
    }
    catch(err)
    {
        if(!err.statusCode)
        {
            err.statusCode=500;
        }
        next(err);
    }

}


/**************************Pie Gender *****************************************/

exports.pieGenderSeverity=async(req,res,next)=>{
    const hospitalId=req.params.hosId;
    try
    {
        const foundAdmin=await Admin.findOne({where:{id:req.userId,hospitalId:hospitalId},attributes:['id','hospitalId']});
        if(!foundAdmin)
        {
            const error=new Error("Admin not found for the hospital");
            error.statusCode=404;
            throw error;
        }
        let date=new Date();
        date=moment(date.toISOString()).format('YYYY-MM-DD');
        const foundRecord=await PatientAmbu.findAll({where:{hospitalId:hospitalId,dated:date}});
        if(foundRecord.length==0)
        {
          const error = new Error('Records not found.');
          error.statusCode = 404;
          throw error;
        }
        let male=0,female=0,low=0,high=0;
        for(let i=0;i<foundRecord.length;i++)
        {
            let el=foundRecord[i];
            const foundPat=await Patient.findByPk(el.patientId,{attributes:['id','gender','severity']});
            if(foundPat.gender=='Male')
            male++;
            else
            female++;

            if(foundPat.severity==1)
            high++;
            else
            low++;
        }
        res.status(200).json({message:"Stats Fetched",male:male,female:female,lowSeverity:low,highSeverity:high});
    }
    catch(err)
    {
        if(!err.statusCode)
        {
            err.statusCode=500;
        }
        next(err);
    }
}