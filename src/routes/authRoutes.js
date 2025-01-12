const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const db = require('../config/db');

// 测试数据库连接
router.get('/test-db', async (req, res) => {
    try {
        const result = await db.query('SELECT NOW()');
        res.json({ 
            success: true, 
            message: '数据库连接成功',
            timestamp: result.rows[0].now 
        });
    } catch (error) {
        console.error('数据库连接测试失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '数据库连接失败',
            error: error.message 
        });
    }
});

// 注册路由
router.post('/register', register);

// 登录路由
router.post('/login', login);

module.exports = router; 