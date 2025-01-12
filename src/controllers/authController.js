const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// 用户注册
exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 输入验证
        if (!username || !password) {
            return res.status(400).json({ message: '用户名和密码不能为空' });
        }

        if (username.length < 3) {
            return res.status(400).json({ message: '用户名长度至少为3个字符' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: '密码长度至少为6个字符' });
        }

        console.log('开始检查用户名是否存在:', username);
        // 检查用户名是否已存在
        const userExists = await db.query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        );

        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: '用户名已存在' });
        }

        console.log('开始加密密码');
        // 加密密码
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        console.log('开始创建新用户');
        // 创建新用户
        const result = await db.query(
            'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id',
            [username, password_hash]
        );

        console.log('用户创建成功，生成 JWT');
        // 生成JWT
        const token = jwt.sign(
            { userId: result.rows[0].id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: '注册成功',
            token,
            userId: result.rows[0].id
        });
    } catch (err) {
        console.error('注册过程出错:', err);
        // 检查是否是数据库连接错误
        if (err.code === 'ECONNREFUSED') {
            return res.status(500).json({ message: '数据库连接失败' });
        }
        // 检查是否是环境变量缺失
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ message: '服务器配置错误: JWT_SECRET 未设置' });
        }
        res.status(500).json({ message: '服务器错误', error: err.message });
    }
};

// 用户登录
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 查找用户
        const result = await db.query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ message: '用户名或密码错误' });
        }

        const user = result.rows[0];

        // 验证密码
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: '用户名或密码错误' });
        }

        // 生成JWT
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: '登录成功',
            token,
            userId: user.id
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '服务器错误' });
    }
}; 