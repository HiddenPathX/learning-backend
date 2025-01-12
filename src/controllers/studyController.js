const db = require('../config/db');

// 记录学习时长
exports.recordStudyTime = async (req, res) => {
    try {
        const { duration } = req.body;
        const userId = req.userId;
        
        // 使用 UTC+8 时区（中国标准时间）
        const now = new Date();
        const chinaDate = new Date(now.getTime() + (8 * 60 * 60 * 1000));
        const date = chinaDate.toISOString().split('T')[0];
        console.log('记录学习时长:', { userId, date, duration });

        // 检查今天是否已有记录
        const existingRecord = await db.query(
            'SELECT * FROM study_records WHERE user_id = $1 AND date = $2',
            [userId, date]
        );

        let result;
        if (existingRecord.rows.length > 0) {
            // 更新现有记录，只更新duration字段
            console.log('更新现有记录');
            result = await db.query(
                'UPDATE study_records SET duration = CAST(duration AS INTEGER) + $1 WHERE user_id = $2 AND date = $3 RETURNING *',
                [parseInt(duration), userId, date]
            );
        } else {
            // 创建新记录，只包含必要字段
            console.log('创建新的专注记录');
            result = await db.query(
                'INSERT INTO study_records (user_id, date, duration) VALUES ($1, $2, $3) RETURNING *',
                [userId, date, parseInt(duration)]
            );
        }

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
        
        // 使用 UTC+8 时区的当前日期，并生成过去7天的日期序列
        const result = await db.query(
            `WITH RECURSIVE dates AS (
                SELECT 
                    (CURRENT_TIMESTAMP AT TIME ZONE 'UTC+8')::date as date
                UNION ALL
                SELECT 
                    date - 1
                FROM dates
                WHERE date > (CURRENT_TIMESTAMP AT TIME ZONE 'UTC+8')::date - INTERVAL '6 days'
            ),
            daily_records AS (
                SELECT 
                    date,
                    CAST(SUM(CAST(duration AS INTEGER)) AS INTEGER) as duration,
                    COUNT(*) as focus_count
                FROM study_records 
                WHERE user_id = $1 
                AND date >= (CURRENT_TIMESTAMP AT TIME ZONE 'UTC+8')::date - INTERVAL '6 days'
                AND date <= (CURRENT_TIMESTAMP AT TIME ZONE 'UTC+8')::date
                GROUP BY date
            )
            SELECT 
                dates.date,
                COALESCE(daily_records.duration, 0) as duration,
                COALESCE(daily_records.focus_count, 0) as focus_count
            FROM dates
            LEFT JOIN daily_records ON dates.date = daily_records.date
            ORDER BY dates.date DESC`,
            [userId]
        );

        console.log('周记录查询结果:', result.rows);
        res.json(result.rows);
    } catch (err) {
        console.error('获取周记录错误:', err);
        res.status(500).json({ message: '服务器错误' });
    }
};