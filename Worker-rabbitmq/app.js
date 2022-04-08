// https://smarticu-worker.herokuapp.com/


var amqp = require('amqplib/callback_api');
const sequelize = require('./database');
const User=require('./user');
const Patient=require('./patient');
const axios = require('axios').default;
const express=require('express');
const hitRoutes=require('./routes/hitRoute');
const app=express();

app.use(hitRoutes);

sequelize.
//sync({force:true}). //reset the schema 
sync().
  then(result=>{
    const server=app.listen(process.env.PORT || 3000,async()=>{
amqp.connect('amqps://lhpjbqej:8-FWsM50vOhW6e-Me1DVr1pMaA_CItM_@cattle.rmq2.cloudamqp.com/lhpjbqej', function(error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }
    var queue = 'severity';

    channel.assertQueue(queue, {
      durable: true
    });
    channel.prefetch(1);
    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
    channel.consume(queue, async(dataIncoming)=>{

        // console.log(dataIncoming.content.toString());
        let data=JSON.parse(dataIncoming.content.toString());
        // console.log(data);
        let payload=data.data;
    try{
    let response;
            //response = await axios.post('http://127.0.0.1:5000/getSeverity', data, {
         response = await axios.post('https://smarticu-flask.herokuapp.com/getSeverity', payload, {
           headers: {
                "content-type": "application/json"
           }
      });

    let severity=response["data"]["result"];
    const pat=await Patient.findByPk(data.patId,{attrinutes:['id','severity','flag']});
    if(pat)
    {
    pat.severity=severity;
    pat.flag=1;
    await pat.save();
    }
    }
    catch(err)
    {
        console.log(err);
    }
    //   var secs = msg.content.toString().split('.').length - 1;

    //   console.log(" [x] Received %s", msg.content.toString());
    //   setTimeout(function() {
    //     console.log(" [x] Done");
    console.log("Done!");
    channel.ack(dataIncoming);
    //   }, secs * 1000);






    }, {
      // manual acknowledgment mode,
      // see ../confirms.html for details
      noAck: false
    });
  });
});

    });

});

