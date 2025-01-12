const db = require('../config/db');

// 记录学习时长
exports.recordStudyTime = async (req, res) => {
    try {
        const { duration } = req.body;
        const userId = req.userId;
        
        // 使用 UTC 时间以确保日期一致性
        const date = new Date().toISOString().split('T')[0];
        console.log('记录学习时长:', { userId, date, duration });

        // 每次专注都创建新记录
        console.log('创建新的专注记录');
        const result = await db.query(
            'INSERT INTO study_records (user_id, date, duration) VALUES ($1, $2, $3) RETURNING *',
            [userId, date, duration]
        );

        console.log('记录结果:', result.rows[0]);
        res.json({ 
            message: '学习时长记录成功',
            record: result.rows[0]
        });
    } catch (err) {
        console.error('记录学习时长错误:', err);
        res.status(500).json({ message: '服务器错误' });
    }
};

// 获取一周学习记录
exports.getWeeklyRecord = async (req, res) => {
    try {
        const userId = req.userId;
        console.log('获取周记录，用户ID:', userId);
        
        // 获取每天的总时长和专注次数
        const result = await db.query(
            `SELECT 
                date,
                SUM(duration) as duration,
                COUNT(*) as focus_count
             FROM study_records 
             WHERE user_id = $1 
             AND date >= CURRENT_DATE - INTERVAL '6 days'
             GROUP BY date
             ORDER BY date DESC`,
            [userId]
        );

        console.log('周记录查询结果:', result.rows);
        res.json(result.rows);
    } catch (err) {
        console.error('获取周记录错误:', err);
        res.status(500).json({ message: '服务器错误' });
    }
}; 