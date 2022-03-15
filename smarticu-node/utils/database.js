const Sequelize=require('sequelize');
// const sequelize=new Sequelize('smart-icu','root','5511',
// {dialect:'mysql',
// host:'localhost',
// storage: "./session.sqlite"});
// module.exports=sequelize;

const sequelize=new Sequelize('heroku_a0f66ce8ef052e9','bfe616c1f61db1','a77dafbe',{dialect:'mysql',host:'us-cdbr-east-03.cleardb.com',storage: "./session.sqlite"});
module.exports=sequelize;

 //mysql://bfe616c1f61db1:a77dafbe@us-cdbr-east-03.cleardb.com/heroku_a0f66ce8ef052e9?reconnect=true