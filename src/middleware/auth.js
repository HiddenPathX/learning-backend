const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        // 从请求头获取token
        const token = req.header('Authorization').replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: '未提供认证令牌' });
        }

        // 验证token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 将用户ID添加到请求对象
        req.userId = decoded.userId;
        
        next();
    } catch (error) {
        res.status(401).json({ message: '认证失败' });
    }
};

module.exports = auth; 