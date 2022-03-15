const Hospital = require("../models/hospital");

/************************************Fetch Hospitals ****************************************************/
exports.getHospital=async(req,res,next)=>{
    try{
        const foundHospitals=await Hospital.findAll({attributes:['id','hospital_name']});
        res.status(200).json({message:"Hospitals Fetched",hospitals:foundHospitals});
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

exports.regHospi=async(req,res,next)=>{

    try{
        const foundH=await Hospital.findOne({where:{hospital_name:req.body.hospitalName},attributes:['id','hospital_name']});
        if(foundH)
        {
            const error=new Error("Hospital Name already exists");
            error.statusCode=404;
            throw error;
        }

        const hospitalName=req.body.hospitalName;        
        const phone=req.body.phone;        
        const street_address=req.body.street_address;

        const thres_value=req.body.thres_value;
        const hospEmail=req.body.email;
        const beds=req.body.bedCount;

        let loca=req.body.location;
        loca={"lat":loca.location.lat,"long":loca.location.lng,"accuracy":loca.accuracy};   

        const newHosp=Hospital.create({hospital_name:hospitalName,phone:phone,beds_available:beds,email:hospEmail,street_address:street_address,thres_value:thres_value,location:loca});
        
        res.status(200).json({message:"Hospital Created"});
    
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