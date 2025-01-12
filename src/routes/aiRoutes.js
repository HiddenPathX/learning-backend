const express = require('express');
const router = express.Router();
const { sendToAI } = require('../controllers/aiController');

// AI请求路由
router.post('/send', sendToAI);

module.exports = router; 