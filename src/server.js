const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// 路由导入
// const authRoutes = require('./routes/authRoutes');
const studyRoutes = require('./routes/studyRoutes');
const aiRoutes = require('./routes/aiRoutes');

// 环境变量配置
dotenv.config();

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 路由
// app.use('/api/auth', authRoutes);
app.use('/api/study', studyRoutes);
app.use('/api/ai', aiRoutes);

// 测试路由
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Study Time Tracking API' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 