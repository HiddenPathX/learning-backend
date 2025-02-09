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
                model: "Pro/deepseek-ai/DeepSeek-R1",
                messages: messages.filter(msg => !msg.isReasoning), // 过滤掉思维链内容
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
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let isReasoning = true; // 标记当前是否在输出思维链
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.trim() === '' || line.trim() === 'data: [DONE]') continue;

                if (line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.slice(6));
                        if (data.choices?.[0]?.delta?.reasoning_content) {
                            // 发送思维链内容
                            res.write(`data: ${JSON.stringify({
                                choices: [{
                                    delta: {
                                        content: data.choices[0].delta.reasoning_content,
                                        isReasoning: true
                                    }
                                }]
                            })}\n\n`);
                        } else if (data.choices?.[0]?.delta?.content) {
                            if (isReasoning) {
                                // 发送分隔标记
                                res.write(`data: ${JSON.stringify({
                                    choices: [{
                                        delta: {
                                            content: "\n---\n",
                                            isTransition: true
                                        }
                                    }]
                                })}\n\n`);
                                isReasoning = false;
                            }
                            // 发送正文内容
                            res.write(`data: ${JSON.stringify({
                                choices: [{
                                    delta: {
                                        content: data.choices[0].delta.content,
                                        isReasoning: false
                                    }
                                }]
                            })}\n\n`);
                        }
                    } catch (error) {
                        console.error('解析消息时出错:', error);
                    }
                }
            }
        }
        res.end();

    } catch (error) {
        console.error('AI请求错误:', error);
        res.write(`data: ${JSON.stringify({ error: '服务器错误: ' + error.message })}\n\n`);
        res.end();
    }
}; 