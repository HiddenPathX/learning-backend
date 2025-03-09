const express = require('express');
const router = express.Router();
const { recordStudyTime, getWeeklyRecord } = require('../controllers/studyController');

// 记录学习时间
router.post('/record', recordStudyTime);

// 获取周学习记录
router.get('/weekly', getWeeklyRecord);

module.exports = router; 