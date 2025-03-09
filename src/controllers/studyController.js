// 移除数据库依赖
// const db = require('../config/db');

// 记录学习时长 - 简化版本，不使用数据库
exports.recordStudyTime = async (req, res) => {
    try {
        const { duration } = req.body;
        
        // 直接返回成功消息
        res.json({ 
            message: '学习时长记录成功',
            record: {
                duration: parseInt(duration),
                date: new Date().toISOString(),
                focus_count: 1
            }
        });
    } catch (err) {
        console.error('记录学习时长错误:', err);
        res.status(500).json({ message: '服务器错误' });
    }
};

// 获取周学习记录 - 简化版本，不使用数据库
exports.getWeeklyRecord = async (req, res) => {
    try {
        // 创建一个模拟的周记录
        const weeklyRecord = [];
        const today = new Date();
        
        // 生成过去7天的记录
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            
            weeklyRecord.push({
                date: date.toISOString().split('T')[0],
                duration: Math.floor(Math.random() * 120), // 随机时长
                focus_count: Math.floor(Math.random() * 5) // 随机专注次数
            });
        }
        
        res.json({
            message: '获取周学习记录成功',
            records: weeklyRecord
        });
    } catch (err) {
        console.error('获取周学习记录错误:', err);
        res.status(500).json({ message: '服务器错误' });
    }
};