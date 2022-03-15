const amqp=require('amqplib/callback_api');
const CONN_URL = 'amqps://lhpjbqej:8-FWsM50vOhW6e-Me1DVr1pMaA_CItM_@cattle.rmq2.cloudamqp.com/lhpjbqej';

let ch;

amqp.connect(CONN_URL, function (err, conn) {
    if(err)
    console.log(err);
    conne=conn;
   conn.createChannel(function (err, channel) {
       if(err)
       console.log(err);
      ch = channel;
   });
});

exports.publishToQueue = async (queueName, data) => {
   //console.log(ch);
    let payload=JSON.stringify(data);
   // console.log(queueName);console.log(data);
    try{
    ch.sendToQueue(queueName, Buffer.from(payload),{persistent:true});
    // setTimeout(function() {
    //     conne.close();
    //     process.exit(0)
    //   }, 500);
     }
    catch(err)
    {
        console.log("Error passing data");
    }
 };

