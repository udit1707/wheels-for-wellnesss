const Ambulance=require('../models/ambulance');
const Patient=require('../models/patient');
const { Op } = require('sequelize')
var distance = require('google-distance-matrix');
const axios = require('axios').default;
const jwt = require('jsonwebtoken');
const PatientAmbu = require('../models/patientAmbu');
const Hospital = require("../models/hospital");
const moment=require('moment');
const User = require('../models/user');
const io = require('../socket');
const DailyAdmission = require('../models/dailyAdmission');
const client = require('twilio')(process.env.ACCOUNT_SID,process.env.AUTH_TOKEN);

//Setting-up google distance matrix API
distance.key(`${process.env.DM_API_KEY}`);
distance.units('metric');
distance.departure_time('now');

//endpoint to create new ambulances
exports.createAmbulance=async(req,res,next)=>{ 
  try
  {
        const regNo=req.body.regNo;
        const driverPhone=req.body.driverPhone;
        let loca=req.body.location;
        if(loca)
        loca={"lat":loca.location.lat,"long":loca.location.lng,"accuracy":loca.accuracy};   
        let amb=await Ambulance.findOne({where:{driver_phone:driverPhone},attributes:['id']});
        if(amb)
        {
            const error = new Error('Number already registered. Enter a unique number');
              error.statusCode = 401;
              throw error
        }
        amb=await Ambulance.create({reg_num:regNo,driver_phone:driverPhone,location:loca});
        res.status(200).json({message:"Ambulance Created"});
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

//Driver app login[OTP based Registered Mobile Number]
exports.verifyLogin = async (req, res, next) => {
  client
      .verify
      .services(process.env.VERIFY_SERVICE_SID)
      .verificationChecks
      .create({
          to: `+${req.query.phno}`,
          code: req.query.otp
      })
      .then(async(data) => {
          if(data.valid)
          {
            const ambulance=await Ambulance.findOne({where:{driver_phone:+req.query.phno},attributes:['id','driver_phone']});
            // console.log(ambulance);
            if(!ambulance)
            {
              // const error = new Error('Record not found.Please enter your registered phone number');
              // error.statusCode = 404;
              // throw error;
              return res.status(404).json({message:"Record not found.Please enter your registered phone number"});

            }
            const token=jwt.sign({ userId:ambulance.id,regNo:ambulance.driver_phone},'somesupersecretsecret',{expiresIn:'1440m'});
            res.status(200).json({message:"Login Success",data:data,token:token,userId:ambulance.id});
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

//Algo triggered everytime an ambulance is available/ride_completed
exports.availableToPick=async(req,res,next)=>{
  try
  {
    // console.log(req.userId);
    const foundAmbu=await Ambulance.findOne({where:{id:req.userId,driver_phone:req.regNo},attributes:['id','available','location','ride_on']})
    if(!foundAmbu)
    {
      const error = new Error("Ambulance not Authorized");
      error.statusCode = 401;
      throw error;
    }
    if(foundAmbu.ride_on==1)
    {
      const error = new Error("Ambulance already in a ride! Cannot update the location now!");
      error.statusCode = 401;
      throw error;
    }
    // const foundAmbu=await Ambulance.findByPk(req.userId,{attributes:['id','available','location']});
    // console.log(foundAmbu);
    foundAmbu.available=1;
    let loca=req.body.location;
    loca={"lat":""+loca.lat,"long":""+loca.lng,"accuracy":""+req.body.accuracy};   
    foundAmbu.location=loca;
    await foundAmbu.save();

    // var origins=[],ambs=[],destinations=[],pats=[];
    // origins.push(""+loca.lat+","+loca.long);
    // ambs.push(foundAmbu.id);
    // const avaAmbu=await Ambulance.findAll({where:{available:1,id:{[Op.ne]:foundAmbu.id}}});
    // // console.log(avaAmbu);
    // if(avaAmbu.length>0)
    // {
    //   for(let i=0;i<avaAmbu.length;i++)
    //   {
    //     origins.push(""+avaAmbu[i].location.lat+","+avaAmbu[i].location.long);
    //     ambs.push(avaAmbu[i].id);
    //   }
    // }
    // let obj3={},obj2={},data=[];
    // const avaPat=await Patient.findAll({where:{request_completed:0}});
    // if(avaPat.length>0)
    // {
    //   for(let i=0;i<avaPat.length;i++)
    //   {
    //     destinations.push(""+avaPat[i].location.lat+","+avaPat[i].location.long);
    //     pats.push(avaPat[i].id);
    //     obj3[avaPat[i].id]=avaPat[i].severity;
    //   }
    
    //   distance.matrix(origins, destinations, async(err, distances)=> {
    //     if (err)
    //     {
    //       return console.log(err);
    //     }
    //     if(!distances)
    //     {
    //       return console.log('no distances');
    //     }
    //     if (distances.status == 'OK') 
    //     {
    //       for (var i=0; i < origins.length; i++) 
    //       {
    //         let obj1={}
    //         for (var j = 0; j < destinations.length; j++)
    //         {
    //           if (distances.rows[0].elements[j].status == 'OK')
    //           {
    //             // let obj1={};
    //             let time=distances.rows[i].elements[j].duration_in_traffic.text.split(" ")[0];
    //             time=parseInt(time)*60;
    //             // console.log(typeof(time));
    //             obj1[pats[j]]=time;
    //           }
    //         }
    //         // console.log(obj1);
    //         obj2[ambs[i]]={...obj1};
    //       }
    //       data.push(obj3);
    //       data.push(obj2);
    //       // console.log(obj3);
    //       // console.log(obj2);
    //       try
    //       {
    //         let response = await axios.post('http://127.0.0.1:5000/getStatus', data, {
    //         // response = await axios.post('https://flaskicu-algo.herokuapp.com/getStatus', data, {
    //         headers: {"content-type": "application/json"}});
    //         let output={...response.data.result}
    //         // console.log(response.data.result);
    //         for(let i in output)
    //         {
    //           const pat=await Patient.findByPk(i);
    //           const amb=await Ambulance.findByPk(output[i]);
    //           pat.request_completed=1;
    //           amb.available=0;
    //           await amb.addPatient(pat);
    //           await pat.save();
    //           await amb.save();
    //         }
    //       }
    //       catch (err)
    //       {
    //         const error = new Error("Error in Fetching Status");
    //         error.statusCode = 400;
    //         throw error;
    //       }
    //       // console.log(obj2);
    //     }});
    // } 

    res.status(200).json({message:"Ambulance Ready to Go"});
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


exports.cancelRide=async(req,res,next)=>{
  let date=new Date();
    date=moment(date.toISOString()).format('YYYY-MM-DD');
  try{
    if(!req.userId)
    {
      const error = new Error("Ambulance not Authorized");
      error.statusCode = 401;
      throw error;
    }
    const foundAmbu=await Ambulance.findByPk(req.userId,{attributes:['id','available','ride_on']});
    if(foundAmbu.ride_on==1)
    {
      const foundPatAmbu=await PatientAmbu.findOne({where:{ambulanceId:foundAmbu.id,ride_completed:0},attributes:['id','patientId','ambulanceId','ride_completed','hospitalId']});
      
      console.log(foundPatAmbu);
      const foundPat=await Patient.findByPk(foundPatAmbu.patientId,{attributes:['id','request_completed']});
      foundPat.request_completed=0;
      const dailyC=await DailyAdmission.findOne({where:{dated:date,hospitalId:foundPatAmbu.hospitalId},attributes:['id','hospitalId','dated','count']});
      dailyC.count=dailyC.count-1;
      await dailyC.save();
      await foundPat.save(); 
      await foundPatAmbu.destroy();
    }
    foundAmbu.available=0;
    foundAmbu.ride_on=0;
    await foundAmbu.save();
    res.status(200).json({message:"Ride Cancelled!"});
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

exports.rideCompleted=async(req,res,next)=>{
  
  try
  {
    // console.log(req.userId);
    // const foundAmbu=await Ambulance.findOne({where:{id:req.userId,driver_phone:req.regNo},attributes:['id','available','location']})
    if(!req.userId)
    {
      const error = new Error("Ambulance not Authorized");
      error.statusCode = 401;
      throw error;
    }
    const foundAmbu=await Ambulance.findByPk(req.userId,{attributes:['id','ride_on']});
    foundAmbu.ride_on=0;
    await foundAmbu.save();
    const patAmbu=await PatientAmbu.findOne({where:{ride_completed:0,ambulanceId:req.userId},attributes:['id','ride_completed']});
    if(patAmbu)
    {
      patAmbu.ride_completed=1;
      await patAmbu.save();
    }

    


    res.status(200).json({message:"Ride Completed"});
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


exports.triggerAlgo=async(req,res,next)=>{
  try{
    let date=new Date();
    date=moment(date.toISOString()).format('YYYY-MM-DD');
    var origins=[],ambs=[],destinations=[],pats=[],hospLoc=[],hospId=[];

    const avaAmbu=await Ambulance.findAll({where:{available:1},attributes:['id','location','available']});
    // console.log(avaAmbu);
    if(avaAmbu.length>0)
    {
      const avaPat=await Patient.findAll({where:{request_completed:0,flag:1},attributes:['id','request_completed','location','severity','flag']});
      if(avaPat.length>0)
        {
          let obj3={},obj2={},data=[],obj5={};
          const avaHosp=await Hospital.findAll({where:{beds_available:{[Op.gt]: 0}},attributes:['id','location','beds_available']});
          // console.log(avaPat);
          if(avaHosp.length>0)
            {
              //arranging ambulances
              for(let i=0;i<avaAmbu.length;i++)
              {
                origins.push(""+avaAmbu[i].location.lat+","+avaAmbu[i].location.long);
                ambs.push(avaAmbu[i].id);
              }
              //arranging hospitals
              for(let i=0;i<avaHosp.length;i++)
              {
                hospLoc.push(""+avaHosp[i].location.lat+","+avaHosp[i].location.long);
                hospId.push(avaHosp[i].id);
              }
              for(let i=0;i<avaPat.length;i++)
              {
                destinations.push(""+avaPat[i].location.lat+","+avaPat[i].location.long);
                pats.push(avaPat[i].id);
                obj3[avaPat[i].id]=avaPat[i].severity;
              }
              console.log(hospLoc);
              console.log(origins);
              console.log(destinations);

              distance.matrix(origins, destinations, async(err, distances)=> {
              if (err)
              {
                return console.log(err);
              }
              if(!distances)
              {
                return console.log('no distances');
              }
              if (distances.status == 'OK') 
              {
                distance.matrix(destinations,hospLoc,async(err, distances2)=> {//API CALL TO GOOGLE DISTANCE MATRIX API SENDING LOCATION COORDINATES AS PARAMS
                if (err)
                {
                  return console.log(err);
                }
                if(!distances2)
                {
                  return console.log('no distances');
                }
                if (distances2.status == 'OK') 
                {
                  console.log("OK");
                  for (var i=0; i < origins.length; i++) 
                  {
                    let obj1={};
                    for (var j = 0; j < destinations.length; j++)
                    {
                      console.log(distances.rows[0].elements[j]);
                      if (distances.rows[0].elements[j].status == 'OK')
                      {
                        // let obj1={};
                        console.log(distances.rows[i].elements[j].duration_in_traffic);
                        let time=distances.rows[i].elements[j].duration_in_traffic.text.split(" ")[0];
                        time=parseInt(time)*60;
                        // console.log(typeof(time));
                        obj1[pats[j]]=time;
                      }
                    }
                    // console.log(obj1);
                    obj2[ambs[i]]={...obj1};
                  }
                  data.push(obj3);
                  data.push(obj2);
                  // console.log(obj3);
                  // console.log(obj2);
                  // console.log(data);
                  for (var i=0; i < destinations.length; i++) 
                  {
                    let obj4={};
                    for (var j = 0; j < hospLoc.length; j++)
                    {
                      // console.log(distances2.rows[0].elements[j]);
                      if (distances2.rows[0].elements[j].status == 'OK')
                      {
                        // let obj1={};
                        // console.log(distances2.rows[i].elements[j].duration_in_traffic);
                        let time=distances2.rows[i].elements[j].duration_in_traffic.text.split(" ")[0];
                        time=parseInt(time)*60;
                        // console.log(typeof(time));
                        obj4[hospId[j]]=time;
                      }
                    }
                      console.log(obj4);
                      obj5[pats[i]]={...obj4};
                  }
                  data.push(obj5);
                  // console.log(data);
                  try
                  {
                  //let response = await axios.post('http://127.0.0.1:5000/getStatus', data, {
                   let response = await axios.post('https://flaskicu-algo.herokuapp.com/getStatus', data, {
                    headers: {"content-type": "application/json"}});
                    let output={...response.data.result}

                    const allothosp=new Map();
                    for(let i in output)
                    {
                      if(!allothosp.has(output[i][1]))
                      {
                        const hosp=await Hospital.findByPk(output[i][1],{attributes:['id','beds_available']});
                        allothosp.set(output[i][1],hosp);
                      }
                    }
                    console.log(response.data.result);
                    // console.log(allothosp);
                    for(let i in output)
                    {
                      const pat=await Patient.findByPk(i,{attributes:['phone_no','id','request_completed']});
                      const amb=await Ambulance.findByPk(output[i][0],{attributes:['id','available','driver_phone','ride_on']});
                      const hosp=allothosp.get(output[i][1]);
                      //const hosp=await Hospital.findByPk(output[i][1],{attributes:['id','beds_available']});
                      pat.request_completed=1;
                      amb.available=0;
                      amb.ride_on=1;
                      hosp.beds_available=hosp.beds_available-1;
                      let  message,message1;
                      try
                      {
                        //message= await client.messages.create({body: "Patient Allocated",from: process.env.TWILIO_PHONE_NUMBER,to: `+${amb.driver_phone}`});
                        //message1= await client.messages.create({body: `Ambulance On its way.`,from: process.env.TWILIO_PHONE_NUMBER,to: `+${pat.phone_no}`});
                      }
                      catch(err)
                      {
                        // console.log(err);
                        console.log("SMS not sent");
                      }
                      // const message= await client.messages.create({body: "Patient Allocated",from: process.env.TWILIO_PHONE_NUMBER,to: amb.driver_phone});
                      // await client.messages.create({body: "Ambulance On its way",from: process.env.TWILIO_PHONE_NUMBER,to: pat.phone_no});
                      const patAmbu=await amb.addPatient(pat,{through:{dated:date}});
                      
                      await hosp.addPatientAmbu(patAmbu);
                      let dailyC=await DailyAdmission.findOne({where:{dated:date,hospitalId:hosp.id},attributes:['id','hospitalId','dated','count']});
                      console.log(dailyC);
                      if(!dailyC)
                      {
                        // console.log("hit");
                        dailyC=await hosp.createDailyAdmission({dated:date,count:1});
                        await dailyC.save();
                      }
                      else
                      {
                        // console.log("hit2");
                        dailyC.count+=1;
                        await dailyC.save();
                      }
                      await pat.save();
                      await amb.save();
                      await hosp.save();
                    }
                  }
                  catch (err)
                  {
                    const error = new Error("Error in Fetching Status");
                    error.statusCode = 400;
                    throw error;
                  }
                }
              });
            }});
          }
        }      
      }
      res.status(200).json({message:"Status Updated: Patients Alloted"});
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
  try
  {
    // const amb=await Ambulance.findOne({where:{id:req.userId,driver_phone:req.regNo},attributes:['id']})
    // if(!amb)
    // {
    //     const error = new Error("Driver not Authorized");
    //      error.statusCode = 401;
    //      throw error;
    // }
    let msg;
    const ambulance=await PatientAmbu.findOne({where:{ride_completed:0,ambulanceId:req.userId},attributes:['id','ride_completed','patientId','ambulanceId','hospitalId']});
    if(!ambulance)
    {
      res.status(200).json({message:"No Patient available"});
    }
    else 
    {
      const pat=await Patient.findByPk(ambulance.patientId,{attributes:['id','first_name','last_name','age','phone_no','gender','location','severity']});
      const hosp=await Hospital.findByPk(ambulance.hospitalId,{attributes:['hospital_name','street_address','phone']});
      return res.status(200).json({message:"Patient Assigned",patientDetails:pat,destHosp:hosp});
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
  