# 食堂订餐系统

一个完整的食堂订餐H5应用，包含用户端和管理后台。

## 技术栈

### 后端
- Node.js + Koa 2
- SQLite 数据库
- JWT 认证

### 前端
- Vue 3 + Vite
- Vant UI 组件库
- Pinia 状态管理
- Vue Router 路由

## 项目结构

```
shop/
├── backend/           # 后端服务
│   ├── server.js     # 入口文件
│   ├── database.js   # 数据库配置
│   ├── middleware/   # 中间件
│   └── routes/       # 路由
├── frontend/         # 前端H5
│   ├── src/
│   │   ├── views/    # 页面
│   │   ├── stores/   # 状态管理
│   │   ├── api/      # API接口
│   │   └── router/   # 路由
│   └── package.json
└── README.md
```

## 快速开始

### 1. 安装后端依赖

```bash
cd backend
npm install
```

### 2. 启动后端服务

```bash
npm start
```
后端服务运行在 http://localhost:3000

### 3. 安装前端依赖

```bash
cd ../frontend
npm install
```

### 4. 启动前端开发服务

```bash
npm run dev
```
前端服务运行在 http://localhost:5173

## 功能模块

### 用户端功能
- 用户登录/注册（手机号）
- 首页 - 快速入口、最新公告
- 菜单浏览 - 按日期和餐次查看
- 购物车 - 商品管理
- 订单管理 - 查看订单、取消订单
- 意见反馈 - 提交反馈、查看历史
- 调查问卷 - 填写问卷
- 通知公告 - 查看通知
- 个人中心 - 资料编辑

### 管理后台功能
（待开发）

## API 接口

### 认证相关
- POST /api/auth/login - 用户登录
- POST /api/auth/send-code - 发送验证码
- GET /api/auth/profile - 获取用户信息
- PUT /api/auth/profile - 更新用户信息

### 菜品相关
- GET /api/dishes - 获取菜品列表
- GET /api/dishes/daily - 获取每日菜单
- GET /api/dishes/categories - 获取分类
- GET /api/dishes/:id - 获取菜品详情

### 订单相关
- POST /api/orders - 创建订单
- GET /api/orders - 获取订单列表
- GET /api/orders/:id - 获取订单详情
- PUT /api/orders/:id/cancel - 取消订单

### 反馈相关
- POST /api/feedback - 提交反馈
- GET /api/feedback - 获取反馈列表

### 问卷相关
- GET /api/surveys - 获取问卷列表
- GET /api/surveys/:id - 获取问卷详情
- POST /api/surveys/:id/responses - 提交问卷

### 通知相关
- GET /api/notices - 获取通知列表
- GET /api/notices/:id - 获取通知详情

## 数据库

系统使用 SQLite 数据库，首次运行会自动创建表结构并初始化示例数据。

## 浏览器支持

- iOS Safari 10+
- Chrome for Android 60+
- 其他主流移动端浏览器
