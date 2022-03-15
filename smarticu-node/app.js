const schedule = require('node-schedule');
const axios = require('axios').default;
const express=require('express');
const app=express();
const bodyParser=require('body-parser');
require('dotenv').config();
const adminRoutes=require('./routes/admin');
const authRoutes=require('./routes/auth');
const ambulanceRoutes=require('./routes/ambu');
const patientRoutes=require('./routes/patient');
const micRoutes=require('./routes/misc');
const rateLimiter=require('./middleware/rateLimit');
// const twilRoutes=require('./routes/twilio');
const Admin=require('./models/admin');
const Hospital=require('./models/hospital');
const Patient=require('./models/patient');
const Ambulance=require('./models/ambulance');
const PatientAmbu=require('./models/patientAmbu');
const sequelize = require('./util/database');
const User = require('./models/user');
var amqp = require('amqplib/callback_api');
const DailyAdmission = require('./models/dailyAdmission');


app.use(bodyParser.json());
// app.use(require('connect').bodyParser());
// // app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));


// middleware to handle CORS exception
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'OPTIONS, GET, POST, PUT, PATCH, DELETE'
    );
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
  });


// Routes
app.use('/auth',authRoutes);
app.use('/ambulance',ambulanceRoutes);
app.use('/patient',patientRoutes);
app.use('/admin',adminRoutes);
app.use(micRoutes);
// app.use(twilRoutes);

// Table Assocations
Hospital.hasMany(Admin);
Patient.belongsToMany(Ambulance,{through:PatientAmbu});
Ambulance.belongsToMany(Patient,{through:PatientAmbu});
Hospital.hasMany(PatientAmbu);
User.hasMany(Patient,{onDelete:"cascade"});
User.hasMany(Admin,{onDelete:"cascade"});
Hospital.hasMany(DailyAdmission);




// middleware to handle errors
app.use((error,req,res,next)=>{
    console.log(error);
    const status=error.statusCode||500;
    const message=error.message;
    const data=error.data;
    res.status(status).json({err_message:message,data:data,status_code:status});
  });

  sequelize.
//sync({force:true}). //reset the schema 
sync().
  then(result=>{
      // console.log(result);
      const server=app.listen(process.env.PORT || 2900,async()=>{
        const isHospital=await Hospital.count();
      if(isHospital==0)
      {
        await Hospital.create({hospital_name:"Hospital 1",phone:"9898578944",street_address:"ABC",location:{"lat":"26.492236737604717","long":"80.28443401099028","accuracy":"-30"}});
        await Hospital.create({hospital_name:"Hospital 2",phone:"9898578944",street_address:"ABC",location:{"lat":"26.494758641337977","long":"80.27883005281376","accuracy":"-30"}});
        await Hospital.create({hospital_name:"Hospital 3",phone:"9898578944",street_address:"ABC",location:{"lat":"26.4782757690296","long":"80.31093878400476","accuracy":"-30"}});
        await Hospital.create({hospital_name:"Hospital 4",phone:"9898578944",street_address:"ABC",location:{"lat":"26.480038081816236","long":"80.30102282633321","accuracy":"-30"}});
        await Hospital.create({hospital_name:"Hospital 5",phone:"9898578944",street_address:"ABC",location:{"lat":"26.415403674098542","long":"80.38208129934671","accuracy":"-30"}});

      }
     console.log("App Server started!");
  });
  // const job = schedule.scheduleJob('23 * * *', async()=>{
  //   const foundHosp=await Hospital.findAll({attributes:['id','thres_value','code_red']});
  //   let obj={};
  //   for(let i=0;i<foundHosp.length;i++)
  //   {
  //     obj[foundHosp[i].id]=foundHosp[i].thres_value;
  //   }
  //   console.log(obj);
  //   let arr=[];arr.push(obj);
  //   //let response = await axios.post('http://127.0.0.1:5000/getForecast', arr, {
  //   let response = await axios.post('https://smaricu-arima.herokuapp.com/getForecast', arr,{
  //     headers: {"content-type": "application/json"}});
  //       // let output={...response.data.result}  
  //   console.log(response);  let res_obj=response.data.result;
  //   for(let i=0;i<foundHosp.length;i++)
  //   {
  //     foundHosp[i].code_red=res_obj[foundHosp[i].id];
  //     await foundHosp[i].save();      
  //   }
  //   console.log("done");

  // });

  

  const io = require('./socket').init(server);
     io.on('connection', socket => {
       console.log("Client connected!");
     });
});