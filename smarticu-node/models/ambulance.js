const Sequelize=require('sequelize');

const sequelize=require('../util/database');

const Ambulance = sequelize.define('ambulance', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  reg_num:Sequelize.STRING,
  driver_phone:Sequelize.BIGINT,
  location:{
    type: Sequelize.TEXT,
    defaultValue:null,
    get: function() {
      return JSON.parse(this.getDataValue("location"));
    },
    set: function(value) {
      return this.setDataValue("location", JSON.stringify(value));
  }
},
  available:{type:Sequelize.BOOLEAN,defaultValue:false},
  ride_on:{type:Sequelize.BOOLEAN,defaultValue:false},
  total_admission:Sequelize.INTEGER
});

module.exports = Ambulance;