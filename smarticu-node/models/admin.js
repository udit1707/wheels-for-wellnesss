const Sequelize=require('sequelize');

const sequelize=require('../util/database');

const Admin = sequelize.define('admin', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  portal_id:Sequelize.STRING,
  password:Sequelize.STRING,
  first_name:Sequelize.STRING,
  last_name:Sequelize.STRING,
  hospital_name:Sequelize.STRING,
  phone:Sequelize.BIGINT
});

module.exports = Admin;