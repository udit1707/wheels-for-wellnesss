const client = require('twilio')(process.env.ACCOUNT_SID,process.env.AUTH_TOKEN);

exports.getCode = async (req, res, next) => {
   
    try{
    const data=await client.verify.services(process.env.VERIFY_SERVICE_SID).verifications.create({to: `+${req.query.phno}`,channel: "sms"});
    res.status(200).send(data);
    }
    catch(err)
    {
        console.log(err);
        res.status(401).json({message:"Error sending OTP"});
    }
    // console.log("HAppening");
    // res.status(401).json({message:"Error sending OTP"});
};

exports.verifyCode = async (req, res, next) => {
   try{
    const data=await client.verify.services(process.env.VERIFY_SERVICE_SID).verificationChecks.create({ to: `+${req.query.phno}`,code: req.query.otp});
    if(data.valid)
    {
        return res.status(200).json({message:"Verification Success",data:data});
    }
    return res.status(401).json({message:"Error in Verification. Verify OTP"});
}
catch(err){
                return res.status(401).json({message:"Error in Verification. Verify OTP and number"});
        }
};