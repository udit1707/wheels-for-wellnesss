const client = require('twilio')(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);

exports.sendSms = async(req,res,next) => {
  try
  {
      const message=await client.messages.create({
       body: "How you dong?",
       from: process.env.TWILIO_PHONE_NUMBER,
       to: `+${req.query.phno}`});
       console.log(message.sid);
       res.status(200).json({message:"Sent"});
       
   }
   catch(err)
   {
     console.log(err);
      console.log("SMS not sent");
   }
}
  
   
