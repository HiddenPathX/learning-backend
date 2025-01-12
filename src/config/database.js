const { Sequelize } = require('sequelize');
require('dotenv').config();

const env = process.env.NODE_ENV || 'development';
const config = require('./config')[env];

const sequelize = new Sequelize(config.url, {
  dialect: config.dialect,
  dialectOptions: config.dialectOptions,
  logging: false,
  pool: config.pool
});

// 测试数据库连接
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功！');
    console.log('当前环境:', env);
    console.log('SSL 配置:', JSON.stringify(config.dialectOptions.ssl, null, 2));
  } catch (error) {
    console.error('数据库连接失败:', error);
    console.error('环境变量:', {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? '已设置' : '未设置'
    });
    throw error;
  }
};

testConnection();

module.exports = sequelize; 