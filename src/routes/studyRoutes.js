const express = require('express');
const router = express.Router();
const { recordStudyTime, getWeeklyRecord } = require('../controllers/studyController');
const auth = require('../middleware/auth');

// 所有路由都需要认证
router.use(auth);

// 记录学习时间
router.post('/record', recordStudyTime);

// 获取周学习记录
router.get('/weekly', getWeeklyRecord);

module.exports = router; 