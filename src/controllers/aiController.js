const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config();

exports.sendToAI = async (req, res) => {
    try {
        // 从请求头获取token
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new Error('未提供认证令牌');
        }

        const token = authHeader.split(' ')[1];
        try {
            jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            throw new Error('认证令牌无效');
        }

        // 从请求体获取messages
        const { messages } = req.body;
        if (!messages) {
            throw new Error('未提供消息内容');
        }

        // 设置CORS头
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        // 设置SSE头
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const response = await fetch(process.env.AI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.AI_API_KEY}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: messages,
                temperature: 0.7,
                max_tokens: 8000,
                stream: true
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'AI请求失败');
        }

        // 直接转发AI的响应流
        await response.body.pipeTo(
            new WritableStream({
                write(chunk) {
                    res.write(chunk);
                },
                close() {
                    res.end();
                }
            })
        );

    } catch (error) {
        console.error('AI请求错误:', error);
        res.write(`data: ${JSON.stringify({ error: '服务器错误: ' + error.message })}\n\n`);
        res.end();
    }
}; 