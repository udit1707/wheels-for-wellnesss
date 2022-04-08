const Sequelize=require('sequelize');

const sequelize=require('./database');

const Patient = sequelize.define('patient', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  first_name:Sequelize.STRING,
  last_name:Sequelize.STRING,
  phone_no:Sequelize.BIGINT,
  age:Sequelize.INTEGER,
  gender:Sequelize.STRING,
  chronic_diseaseQ:Sequelize.INTEGER,
  respiratory_s:Sequelize.INTEGER,
  weakness_s:Sequelize.INTEGER,
  gastrointestinal_s:Sequelize.INTEGER,
  other_s:Sequelize.INTEGER,
  nausea_s:Sequelize.INTEGER,
  cardiac_s:Sequelize.INTEGER,
  highFever_s:Sequelize.INTEGER,
  kidney_s:Sequelize.INTEGER,
  asymptomatic:Sequelize.INTEGER,
  fever_s:Sequelize.INTEGER,
  diabetes_cd:Sequelize.INTEGER,
  neuro_cd:Sequelize.INTEGER,
  hyperTension_cd:Sequelize.INTEGER,
  cancer_cd:Sequelize.INTEGER,
  ortho_cd:Sequelize.INTEGER,
  respiratory_cd:Sequelize.INTEGER,
  cardiac_cd:Sequelize.INTEGER,
  kidney_cd:Sequelize.INTEGER,
  blood_cd:Sequelize.INTEGER,
  prostate_cd:Sequelize.INTEGER,
  thyroid_cd:Sequelize.INTEGER,
  severity:{type:Sequelize.INTEGER, defaultValue:0},
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
  request_completed:{type:Sequelize.INTEGER, defaultValue:0},
  flag:{type:Sequelize.INTEGER, defaultValue:0}

});

module.exports = Patient;