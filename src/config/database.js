const { Sequelize } = require('sequelize');
require('dotenv').config();

const env = process.env.NODE_ENV || 'development';
const config = require('./config')[env];

const sequelize = new Sequelize(config.url, {
  dialect: config.dialect,
  dialectOptions: config.dialectOptions,
  logging: false
});

module.exports = sequelize; 