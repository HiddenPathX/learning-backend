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

// 获取端口号
const port = process.env.PORT || 3000;

// 启动服务器
const server = app.listen(port, () => {
    console.log('=== 服务器启动信息 ===');
    console.log(`服务器运行在端口: ${port}`);
    console.log(`环境: ${process.env.NODE_ENV}`);
    console.log(`CORS 配置: ${process.env.CORS_ORIGIN}`);
    console.log('=====================');
});

// 优雅关闭
process.on('SIGTERM', () => {
    console.log('收到 SIGTERM 信号，准备关闭服务器...');
    server.close(() => {
        console.log('服务器已关闭');
        sequelize.close().then(() => {
            console.log('数据库连接已关闭');
            process.exit(0);
        });
    });
}); 