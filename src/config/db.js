const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
});

// 初始化数据库时区设置
pool.query('SET timezone = "UTC"');

module.exports = {
    query: (text, params) => pool.query(text, params)
}; 