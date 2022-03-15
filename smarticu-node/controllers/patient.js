const Patient=require('../models/patient');
const User=require('../models/user');
const jwt = require('jsonwebtoken');
const client = require('twilio')(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);
const Hospital=require('../models/hospital');
const axios = require('axios').default;
const PatAmbu=require('../models/patientAmbu');
const Ambulance = require('../models/ambulance');
const Publisher=require('../services/MQService');




// [OTP based Registered Mobile Number]
exports.verifyLogin = async (req, res, next) => {
  client
      .verify
      .services(process.env.VERIFY_SERVICE_SID)
      .verificationChecks
      .create({
          to: `+${req.query.phno}`,
          code: req.query.otp
      })
      .then(async (data) => {
          if(data.valid)
          {
            const user=await User.findOne({where:{phone:+req.query.phno},attributes:['id','phone']});
            if(!user)
            {
              const error = new Error('User not found.Please enter your registered phone number');
              error.statusCode = 404;
              throw error;
            }
            const pat=await user.getPatient({attributes:['id','first_name','last_name','age']});
            const token=jwt.sign({ userId:pat.id,regNo:user.phone},'somesupersecretsecret',{expiresIn:'1440m'});
            res.status(200).json({message:"Login Success",data:data,token:token,userId:pat.id,first_name:pat.first_name,last_name:pat.last_name,age:pat.age});
              // res.status(200).json({message:"Verification Success",data:data,token:token});
          }
          else
          {
              res.status(401).json({message:"Wrong OTP"});
          }
      }).catch(()=>{
        return res.status(401).json({message:"Error in Verification. Verify OTP and number"});

    });
      
};

// {"lat":"26.491013230709004","long":"80.28794365180246","accuracy":"-30"}
//{"lat":"26.493999524203954","long":"80.28311567545674","accuracy":"-30"}
// {"lat":"26.487423780768484","long":"80.28992698248064","accuracy":"-30"}

//{"lat":"26.488437686301776","long":"80.28918913026368","accuracy":"-30"}
//{"lat":"26.492273537751633","long":"80.2845422311952","accuracy":"-30"}

exports.postRequest=async(req,res,next)=>{
  // console.log(req.body);
    let ageF,genderF;
    let age=req.body.age;
    let gender=req.body.gender;
    let chronicD=req.body.chronicDisease;
    let respS=req.body.respiratoryS;
    let weaknesS=req.body.weaknesS;
    let gastroS=req.body.gastroS;
    let otherS=req.body.otherS;
    let nauseaS=req.body.nauseaS;
    let cardiacS=req.body.cardiacS;
    let feverS=req.body.feverS;
    let hFeverS=req.body.highFeverS;
    let kidneyS=req.body.kidneyS;
    let asymptomat=req.body.asymptomat;
    let diabCD=req.body.diabCD;
    let neuroCD=req.body.neuroCD;
    let hyperTCD=req.body.hyperTCD;
    let cancerCD=req.body.cancerCD;
    let orthoCD=req.body.orthoCD;
    let respCD=req.body.respCD;
    let cardiacCD=req.body.cardiacCD;
    let kidneyCD=req.body.kidneyCD;
    let bloodCD=req.body.bloodCD;
    let prostateCD=req.body.prostateCD;
    let thyroidCD=req.body.thyroidCD;
    let loca=req.body.location;
    
    if(gender=='Male')
    genderF=0;
    else
    genderF=1;
    if(feverS=='Yes')
    feverS=1;
    else
    feverS=0;
    if(weaknesS=='Yes')
    weaknesS=1;
    else
    weaknesS=0;
    if(chronicD=='Yes')
    chronicD=1;
    else
    chronicD=0;
    if(respS=='Yes')
    respS=1;
    else
    respS=0;
    if(gastroS=='Yes')
    gastroS=1;
    else
    gastroS=0;
    if(otherS=='Yes')
    otherS=1;
    else
    otherS=0;
    if(nauseaS=='Yes')
    nauseaS=1;
    else
    nauseaS=0;
    if(cardiacS=='Yes')
    cardiacS=1;
    else
    cardiacS=0;
    if(hFeverS=='Yes')
    hFeverS=1;
    else
    hFeverS=0;
    if(asymptomat=='Yes')
    asymptomat=1;
    else
    asymptomat=0;
    if(diabCD=='Yes')
    diabCD=1;
    else
    diabCD=0;
    if(kidneyS=='Yes')
    kidneyS=1;
    else
    kidneyS=0;
    if(neuroCD=='Yes')
    neuroCD=1;
    else
    neuroCD=0;
    if(hyperTCD=='Yes')
    hyperTCD=1;
    else
    hyperTCD=0;
    if(cancerCD=='Yes')
    cancerCD=1;
    else
    cancerCD=0;
    if(orthoCD=='Yes')
    orthoCD=1;
    else
    orthoCD=0;
    if(respCD=='Yes')
    respCD=1;
    else
    respCD=0;
    if(cardiacCD=='Yes')
    cardiacCD=1;
    else
    cardiacCD=0;
    if(kidneyCD=='Yes')
    kidneyCD=1;
    else
    kidneyCD=0;
    if(bloodCD=='Yes')
    bloodCD=1;
    else
    bloodCD=0;
    if(prostateCD=='Yes')
    prostateCD=1;
    else
    prostateCD=0;
    if(thyroidCD=='Yes')
    thyroidCD=1;
    else
    thyroidCD=0;
    if(age<=9)
    ageF=0;
    else if(age<=19)
    ageF=1;
    else if(age<=29)
    ageF=2;
    else if(age<=39)
    ageF=3;
    else if(age<=49)
    ageF=4;
    else if(age<=59)
    ageF=5;
    else if(age<=69)
    ageF=6;
    else if(age<=79)
    ageF=7;
    else if(age<=89)
    ageF=8;
    else
    ageF=9;


    loca={"lat":loca.location.lat,"long":loca.location.lng,"accuracy":loca.accuracy};   
     
    try
    {
      let FaultPat=await Patient.findOne({where: {first_name:req.body.firstName ,last_name:req.body.lastName, age:age, gender:gender, request_completed:0,phone_no:req.body.phoneNo},attributes:['id','request_completed','phone_no','age','gender','first_name','last_name']});
      console.log(FaultPat);
      if(FaultPat)
      {
        const error = new Error("Ride for the patient with same personal credentials is already in progress!");
        error.statusCode = 404;
        throw error;
      }
      let user=await User.findOne({where:{phone:req.body.phoneNo},attributes:['id','phone','first_name','last_name']});

     if(user)
    {
      if(user.first_name != req.body.firstName || user.last_name != req.body.lastName)
      {
        const error = new Error("Number already registered with another Patient.");
        error.statusCode = 404;
        throw error;
      }
    }
      let input=[];
      input.push(ageF);
      input.push(chronicD);
      input.push(genderF);
      input.push(respS);
      input.push(weaknesS);
      input.push(feverS);
      input.push(gastroS);
      input.push(otherS);
      input.push(nauseaS);
      input.push(cardiacS);
      input.push(hFeverS);
      input.push(kidneyS);
      input.push(asymptomat);
      input.push(diabCD);
      input.push(neuroCD);
      input.push(hyperTCD);
      input.push(cancerCD);
      input.push(orthoCD);
      input.push(respCD);
      input.push(cardiacCD);
      input.push(kidneyCD);
      input.push(bloodCD);
      input.push(prostateCD);
      input.push(thyroidCD);

      //   "chronicD":chronicD,
      //   "gender":genderF,
      //   "respS":respS,
      //   "weaknesS":weaknesS,
      //   "feverS":feverS,
      //   "gastroS":gastroS,
      //   "otherS":otherS,
      //   "nauseaS":nauseaS,
      //   "cardiacS":cardiacS,
      //   "hFeverS":hFeverS,
      //   "kidneyS":kidneyS,
      //   "asymptomat":asymptomat,
      //   "diabCD":diabCD,
      //   "neuroCD":neuroCD,
      //   "hyperTCD":hyperTCD,
      //   "cancerCD":cancerCD,
      //   "orthoCD":orthoCD,
      //   "respCD":respCD,
      //   "cardiacCD":cardiacCD,
      //   "kidneyCD":kidneyCD,http://localhost:2900
      //   "bloodCD":bloodCD,
      //   "prostateCD":prostateCD,
      //   "thyroidCD":thyroidCD
      // };
      let data={input:input};
      let response;
    //   try 
    //   {
    //     // response = await axios.post('http://127.0.0.1:5000/getSeverity', data, {
    //       response = await axios.post('https://smarticu-flask.herokuapp.com/getSeverity', data, {
    //        headers: {
    //             "content-type": "application/json"
    //        }
    //   });
    // }


    // catch (err) {
    //     const error = new Error("Error in sending data to queue");
    //     error.statusCode = 400;
    //     throw error;
    // }
    // console.log(response);
    //let severity=response["data"]["result"];
    // console.log(severity);
    if(!user)
    user=await User.create({role:"Patient",first_name:req.body.firstName,last_name:req.body.lastName,phone:req.body.phoneNo});
    let pati=await user.createPatient({first_name:req.body.firstName,last_name:req.body.lastName,phone_no:req.body.phoneNo,age:age,
        chronic_diseaseQ:chronicD,
      gender:gender,
      respiratory_s:respS,
      weakness_s:weaknesS,
      fever_s:feverS,
      gastrointestinal_s:gastroS,
      other_s:otherS,
      nausea_s:nauseaS,
      cardiac_s:cardiacS,
      highFever_s:hFeverS,
      kidney_s:kidneyS,
      asymptomatic:asymptomat,
      diabetes_cd:diabCD,
      neuro_cd:neuroCD,
      hyperTension_cd:hyperTCD,
      cancer_cd:cancerCD,
      ortho_cd:orthoCD,
      respiratory_cd:respCD,
      cardiac_cd:cancerCD,
      kidney_cd:kidneyCD,
      blood_cd:bloodCD,
      prostate_cd:prostateCD,
      thyroid_cd:thyroidCD,location:loca});

      try 
      {
        // response = await axios.post('http://127.0.0.1:5000/getSeverity', data, {
      //     response = await axios.post('https://smarticu-flask.herokuapp.com/getSeverity', data, {
      //      headers: {
      //           "content-type": "application/json"
      //      }
      // });

      // console.log(pati);
      // let payload={data:data,patOb:pati};
        

    


      let payload={data:data,patId:pati.id};
      await Publisher.publishToQueue('severity',payload);
    }
    catch (err) {
        const error = new Error("Error in sending data to queue");
        error.statusCode = 400;
        throw error;
    }


      const token=jwt.sign({ userId:pati.id,regNo:pati.phone_no},'somesupersecretsecret',{expiresIn:'240m'});
     

      res.status(200).json({message:"Patient Registered",token:token});
    }
    catch(err)
    {
        if (!err.statusCode) 
      {
        err.statusCode = 500;
      }
      next(err);
    }
}

//Can be called from the dashboard
exports.fetchPatientInfo=async(req,res,next)=>{
  try
  {
    await Ambulance.findOne({where:{id:req.userId,driver_phone:req.regNo},attributes:['id']})
    const pat=await Patient.findOne({where:{id:req.userId,phone_no:req.regNo}})
    if(!pat)
    {
      const error = new Error("Record not found");
         error.statusCode = 404;
         throw error;
    }
    res.status(200).json({message:"Patient Details Fetched",data:pat});
  }

  catch(err)
    {
        if (!err.statusCode) 
      {
        err.statusCode = 500;
      }
      next(err);
    }
}

exports.fetchStatus=async(req,res,next)=>{
  try{
    // const pat=await Patient.findOne({where:{id:req.userId,phone_no:req.regNo},attributes:['id']})
    // if(!pat)
    // {
    //     const error = new Error("Patient not Authorized");
    //      error.statusCode = 401;
    //      throw error;
    // }
    console.log(req.userId);
    let msg;
    const ambulance=await PatAmbu.findOne({where:{ride_completed:0,patientId:req.userId},attributes:['id','ride_completed','patientId','ambulanceId','hospitalId']});
    if(!ambulance)
    {
      res.status(200).json({message:"No Current ride in transit"});
    }
    else 
    {
      const amb=await Ambulance.findByPk(ambulance.ambulanceId,{attributes:['id','driver_phone','reg_num']});
      const hosp=await Hospital.findByPk(ambulance.hospitalId,{attributes:['hospital_name','street_address','phone']});

      return res.status(200).json({message:"Your ambulance is on the way",driverPhone:amb.driver_phone,vehicleNo:amb.reg_num,destHosp:hosp});
    }
    // const ambulance=await pat.getAmbulances({include:{model:PatAmbu,where:{ride_completed:0}}});
    // console.log(ambulance);
    // res.status(200).json({message:"Success"});
  }
  catch(err)
  {
    if (!err.statusCode) 
      {
        err.statusCode = 500;
      }
      next(err);
  }
}