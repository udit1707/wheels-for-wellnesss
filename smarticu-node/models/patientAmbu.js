const Sequelize=require('sequelize');

const sequelize=require('../util/database');

const PatientAmbu = sequelize.define('patientAmbu', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  ride_completed:{type:Sequelize.BOOLEAN,defaultValue:false},
  dated:
      {
        type: Sequelize.DATEONLY,
        allowNull:false,
      }
});

module.exports = PatientAmbu;