const StudyRecord = require('../models/StudyRecord');

// 记录学习时长
exports.recordStudy = async (req, res) => {
    try {
        const { duration, timestamp } = req.body;
        const userId = req.user._id;

        console.log('记录学习时长:', {
            userId,
            duration,
            timestamp: timestamp || new Date()
        });

        const record = new StudyRecord({
            userId,
            duration,
            timestamp: timestamp || new Date()
        });

        await record.save();
        console.log('学习记录保存成功');

        // 保存成功后立即获取最新统计
        const stats = await getLatestStats(userId);
        res.status(201).json({ 
            message: '记录成功',
            stats  // 返回最新统计数据
        });
    } catch (error) {
        console.error('记录学习时长失败:', error);
        res.status(500).json({ message: '记录失败', error: error.message });
    }
};

// 获取最新统计数据的辅助函数
async function getLatestStats(userId) {
    const now = new Date();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const weekEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 7);

    console.log('计算最新统计:', {
        userId,
        weekStart,
        weekEnd
    });

    const records = await StudyRecord.find({
        userId,
        timestamp: {
            $gte: weekStart,
            $lt: weekEnd
        }
    }).sort('timestamp');

    console.log('查询到的记录数:', records.length);

    const weeklyData = Array(7).fill(0);
    let weeklyTotal = 0;
    let longestSession = 0;

    records.forEach(record => {
        const dayOfWeek = new Date(record.timestamp).getDay();
        weeklyData[dayOfWeek] += record.duration;
        weeklyTotal += record.duration;
        longestSession = Math.max(longestSession, record.duration);
    });

    return {
        weeklyData,
        weeklyTotal,
        dailyAverage: weeklyTotal / 7,
        longestSession
    };
}

// 获取周学习统计
exports.getWeeklyStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const stats = await getLatestStats(userId);
        console.log('统计结果:', stats);
        res.json(stats);
    } catch (error) {
        console.error('获取统计数据失败:', error);
        res.status(500).json({ message: '获取统计数据失败', error: error.message });
    }
}; 