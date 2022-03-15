const Sequelize=require('sequelize');

const sequelize=require('../util/database');

const User = sequelize.define('user', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  first_name:Sequelize.STRING,
  last_name:Sequelize.STRING,
  role:Sequelize.STRING,
  phone:Sequelize.BIGINT,
});

module.exports = User;