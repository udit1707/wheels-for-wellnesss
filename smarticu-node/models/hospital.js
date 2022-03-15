const Sequelize=require('sequelize');

const sequelize=require('../util/database');

const Hospital = sequelize.define('hospital', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  hospital_name:Sequelize.STRING,
  email:Sequelize.STRING,
  phone:Sequelize.BIGINT,
  street_address:Sequelize.STRING,
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
  beds_available:Sequelize.INTEGER,
  thres_value:Sequelize.INTEGER,
  code_red: {type:Sequelize.INTEGER, defaultValue:0}
});

module.exports = Hospital;