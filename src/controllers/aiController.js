const dotenv = require('dotenv');
// 移除jwt引用
// const jwt = require('jsonwebtoken');

dotenv.config();

exports.sendToAI = async (req, res) => {
    try {
        console.log('收到AI请求');
        
        // 从请求体获取messages
        const { messages } = req.body;
        if (!messages) {
            console.error('未提供消息内容');
            throw new Error('未提供消息内容');
        }

        console.log('请求消息:', JSON.stringify(messages, null, 2));

        // 设置CORS头
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        // 构建完整的API URL
        const apiHost = process.env.API_HOST || 'https://api.deepseek.com';
        const apiPath = process.env.API_PATH || '/v1/chat/completions';
        const apiUrl = `${apiHost}${apiPath}`;
        
        // 检查URL是否有效
        if (!apiHost || !apiPath) {
            throw new Error('API_HOST或API_PATH环境变量未设置，无法构建有效的API URL');
        }
        
        console.log('发送请求到:', apiUrl);
        console.log('请求体:', JSON.stringify({
            model: "Pro/deepseek-ai/DeepSeek-R1",
            messages: messages.filter(msg => !msg.isReasoning),
            temperature: 0.6,
            max_tokens: 8000,
            stream: true
        }, null, 2));

        // 检查环境变量
        console.log('环境变量检查:');
        console.log('API_HOST:', process.env.API_HOST);
        console.log('API_PATH:', process.env.API_PATH);
        console.log('AI_API_KEY:', process.env.AI_API_KEY ? '已设置' : '未设置');

        try {
            console.log('开始发送请求到外部API');
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.AI_API_KEY}`,
                    'Accept': 'text/event-stream'
                },
                body: JSON.stringify({
                    model: "Pro/deepseek-ai/DeepSeek-R1", // 使用siliconflow API的模型名称
                    messages: messages.filter(msg => !msg.isReasoning),
                    temperature: 0.6,
                    max_tokens: 8000,
                    stream: true
                })
            });

            console.log('API响应状态:', response.status);
            console.log('API响应头:', [...response.headers.entries()]);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API错误响应:', errorText);
                throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
            }

            // 设置响应头
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            
            console.log('开始处理流式响应');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                
                if (done) {
                    console.log('流式响应结束');
                    break;
                }
                
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.trim() === '' || line.trim() === 'data: [DONE]') continue;

                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (data.choices?.[0]?.delta?.content) {
                                const content = data.choices[0].delta.content;
                                
                                // 直接发送所有内容作为正文
                                res.write(`data: ${JSON.stringify({
                                    choices: [{
                                        delta: {
                                            content: content,
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
            console.log('响应结束');
            res.end();

        } catch (error) {
            console.error('外部API请求错误:', error);
            res.status(500).json({ error: '外部API请求错误: ' + error.message });
        }
    } catch (error) {
        console.error('AI请求错误:', error);
        res.status(500).json({ error: '服务器错误: ' + error.message });
    }
}; 