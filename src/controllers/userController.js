const User = require('../models/User');
const jwt = require('jsonwebtoken');

// 注册新用户
exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 检查用户名是否已存在
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: '用户名已存在' });
        }

        // 创建新用户
        const user = new User({ username, password });
        await user.save();

        res.status(201).json({ message: '注册成功' });
    } catch (error) {
        res.status(500).json({ message: '注册失败', error: error.message });
    }
};

// 用户登录
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 查找用户
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: '用户名或密码错误' });
        }

        // 验证密码
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: '用户名或密码错误' });
        }

        // 生成 JWT
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ token, username: user.username });
    } catch (error) {
        res.status(500).json({ message: '登录失败', error: error.message });
    }
}; 