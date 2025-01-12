# Learning App Backend

这是一个基于 Node.js + Express + MongoDB 的学习应用后端服务。

## 功能特性

- 用户认证（注册/登录）
- JWT token 认证
- 学习时长记录
- 周学习统计数据

## 技术栈

- Node.js
- Express
- MongoDB (with Mongoose)
- JWT for authentication
- bcryptjs for password hashing
- cors for cross-origin resource sharing

## 环境要求

- Node.js >= 14.0.0
- MongoDB

## 环境变量

创建 `.env` 文件并设置以下环境变量：

```env
PORT=3000
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret-key
CORS_ORIGIN=your-frontend-url
```

## 安装

```bash
npm install
```

## 开发运行

```bash
npm run dev
```

## 生产运行

```bash
npm start
```

## API 端点

### 认证相关

- POST `/api/auth/register` - 用户注册
- POST `/api/auth/login` - 用户登录

### 学习统计相关

- POST `/api/stats/record` - 记录学习时长
- GET `/api/stats/weekly` - 获取周学习统计

## Render 部署步骤

1. 在 Render 上创建新的 Web Service
2. 连接你的 GitHub 仓库
3. 设置以下配置：
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
4. 添加环境变量：
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `CORS_ORIGIN`
5. 点击 "Create Web Service"

## 注意事项

- 确保在生产环境中使用安全的 JWT 密钥
- 配置正确的 CORS 设置以允许前端访问
- 使用 MongoDB Atlas 作为生产环境数据库
- 定期备份数据库

## 开发者

[你的名字]

## 许可证

ISC
