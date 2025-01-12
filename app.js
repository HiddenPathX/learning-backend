const express = require('express');
const cors = require('cors');
require('dotenv').config();

const sequelize = require('./src/config/database');
const authRoutes = require('./src/routes/auth');
const statsRoutes = require('./src/routes/stats');

const app = express();

// 中间件
app.use(express.json());
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

// 数据库同步
sequelize.sync()
    .then(() => console.log('Database synced'))
    .catch(err => console.error('Database sync error:', err));

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/stats', statsRoutes);

// 健康检查端点
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: '服务器内部错误' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 