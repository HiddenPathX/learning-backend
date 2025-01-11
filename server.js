const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// 启用 CORS
app.use(cors());
app.use(express.json());

// AI 聊天接口
app.post('/api/chat', async (req, res) => {
    try {
        const response = await axios.post('https://api.deepseek.com/chat/completions', {
            model: "deepseek-chat",
            messages: req.body.messages,
            temperature: 0.7,
            max_tokens: 4000
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
            }
        });
        
        res.json(response.data);
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
        res.status(500).json({
            error: '服务器处理请求时出错'
        });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 