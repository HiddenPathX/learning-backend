const fetch = require('node-fetch');
const dotenv = require('dotenv');

dotenv.config();

exports.sendToAI = async (req, res) => {
    try {
        const { messages } = req.body;

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
                max_tokens: 4000
            })
        });

        const data = await response.json();

        if (!data.choices || !data.choices[0]) {
            return res.status(500).json({ message: 'AI响应失败' });
        }

        res.json({ content: data.choices[0].message.content });
    } catch (error) {
        console.error('AI请求错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
}; 