const db = require('../config/db');

// 记录学习时长
exports.recordStudyTime = async (req, res) => {
    try {
        const { duration } = req.body;
        const userId = req.userId;
        const date = new Date().toISOString().split('T')[0];

        // 检查今天是否已有记录
        const existingRecord = await db.query(
            'SELECT * FROM study_records WHERE user_id = $1 AND date = $2',
            [userId, date]
        );

        if (existingRecord.rows.length > 0) {
            // 更新现有记录
            await db.query(
                'UPDATE study_records SET duration = duration + $1 WHERE user_id = $2 AND date = $3',
                [duration, userId, date]
            );
        } else {
            // 创建新记录
            await db.query(
                'INSERT INTO study_records (user_id, date, duration) VALUES ($1, $2, $3)',
                [userId, date, duration]
            );
        }

        res.json({ message: '学习时长记录成功' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '服务器错误' });
    }
};

// 获取一周学习记录
exports.getWeeklyRecord = async (req, res) => {
    try {
        const userId = req.userId;
        const result = await db.query(
            `SELECT date, duration 
             FROM study_records 
             WHERE user_id = $1 
             AND date >= CURRENT_DATE - INTERVAL '6 days'
             ORDER BY date`,
            [userId]
        );

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '服务器错误' });
    }
}; 