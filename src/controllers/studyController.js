const db = require('../config/db');

// 记录学习时长
exports.recordStudyTime = async (req, res) => {
    try {
        const { duration } = req.body;
        const userId = req.userId;
        
        // 检查今天是否已有记录
        const existingRecord = await db.query(
            `SELECT * FROM study_records 
             WHERE user_id = $1 
             AND date::date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Shanghai')::date`,
            [userId]
        );

        let result;
        if (existingRecord.rows.length > 0) {
            // 更新现有记录
            result = await db.query(
                `UPDATE study_records 
                 SET duration = CAST(duration AS INTEGER) + $1 
                 WHERE user_id = $2 
                 AND date::date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Shanghai')::date
                 RETURNING *`,
                [parseInt(duration), userId]
            );
        } else {
            // 创建新记录
            result = await db.query(
                `INSERT INTO study_records (user_id, date, duration) 
                 VALUES ($1, CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Shanghai', $2) 
                 RETURNING *`,
                [userId, parseInt(duration)]
            );
        }

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
        
        // 添加调试日志
        console.log('Current server time:', new Date().toISOString());
        console.log('Current China time:', new Date(Date.now() + (8 * 60 * 60 * 1000)).toISOString());
        
        const result = await db.query(
            `WITH RECURSIVE dates AS (
                SELECT 
                    (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Shanghai')::date as date
                UNION ALL
                SELECT 
                    date - 1
                FROM dates
                WHERE date > ((CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Shanghai')::date - INTERVAL '6 days')
            ),
            daily_records AS (
                SELECT 
                    date::date as date,  -- 简化日期处理
                    CAST(SUM(CAST(duration AS INTEGER)) AS INTEGER) as duration,
                    COUNT(*) as focus_count
                FROM study_records 
                WHERE user_id = $1 
                AND date::date >= ((CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Shanghai')::date - INTERVAL '6 days')
                AND date::date <= (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Shanghai')::date
                GROUP BY date::date
            )
            SELECT 
                TO_CHAR(dates.date, 'YYYY-MM-DD') as date,
                COALESCE(daily_records.duration, 0) as duration,
                COALESCE(daily_records.focus_count, 0) as focus_count
            FROM dates
            LEFT JOIN daily_records ON dates.date = daily_records.date
            ORDER BY dates.date DESC`,
            [userId]
        );

        // 添加调试日志
        console.log('Query result:', result.rows);
        
        res.json(result.rows);
    } catch (err) {
        console.error('获取周记录错误:', err);
        res.status(500).json({ message: '服务器错误' });
    }
};