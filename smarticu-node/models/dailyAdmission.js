const Sequelize=require('sequelize');

const sequelize=require('../util/database');

const DailyAdmission = sequelize.define('dailyAdmission', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  count:Sequelize.INTEGER,
  dated:
      {
        type: Sequelize.DATEONLY,
        allowNull:false,
      }
});

module.exports = DailyAdmission;