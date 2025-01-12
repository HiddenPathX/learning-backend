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
        res.status(201).json({ message: '记录成功' });
    } catch (error) {
        console.error('记录学习时长失败:', error);
        res.status(500).json({ message: '记录失败', error: error.message });
    }
};

// 获取周学习统计
exports.getWeeklyStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const now = new Date();
        const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
        const weekEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 7);

        console.log('获取周统计:', {
            userId,
            weekStart,
            weekEnd
        });

        // 获取本周的所有记录
        const records = await StudyRecord.find({
            userId,
            timestamp: {
                $gte: weekStart,
                $lt: weekEnd
            }
        }).sort('timestamp');

        console.log('查询到的记录数:', records.length);

        // 初始化每天的学习时长数组
        const weeklyData = Array(7).fill(0);
        let weeklyTotal = 0;
        let longestSession = 0;

        // 统计每天的学习时长
        records.forEach(record => {
            const dayOfWeek = new Date(record.timestamp).getDay();
            weeklyData[dayOfWeek] += record.duration;
            weeklyTotal += record.duration;
            longestSession = Math.max(longestSession, record.duration);
        });

        const dailyAverage = weeklyTotal / 7;

        const response = {
            weeklyData,
            weeklyTotal,
            dailyAverage,
            longestSession
        };

        console.log('统计结果:', response);
        res.json(response);
    } catch (error) {
        console.error('获取统计数据失败:', error);
        res.status(500).json({ message: '获取统计数据失败', error: error.message });
    }
}; 