const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class StudyRecord extends Model {}

StudyRecord.init({
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'StudyRecord',
  indexes: [
    {
      fields: ['userId', 'timestamp']
    }
  ]
});

module.exports = StudyRecord; 