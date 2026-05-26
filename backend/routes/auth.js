const Router = require('koa-router');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { db } = require('../database');
const { JWT_SECRET } = require('../middleware/auth');

const router = new Router();

router.post('/login', async (ctx) => {
  const { phone, code } = ctx.request.body;
  
  if (!phone) {
    ctx.status = 400;
    ctx.body = { error: '请输入手机号' };
    return;
  }

  return new Promise((resolve) => {
    db.get("SELECT * FROM users WHERE phone = ?", [phone], (err, user) => {
      if (err) {
        ctx.status = 500;
        ctx.body = { error: '服务器错误' };
        resolve();
        return;
      }

      if (!user) {
        db.run("INSERT INTO users (name, phone) VALUES (?, ?)", 
          ['用户' + phone.slice(-4), phone], function(err) {
            if (err) {
              ctx.status = 500;
              ctx.body = { error: '注册失败' };
              resolve();
              return;
            }

            const userId = this.lastID;
            const token = jwt.sign({ userId, phone }, JWT_SECRET, { expiresIn: '30d' });
            
            ctx.body = { 
              token, 
              user: { id: userId, name: '用户' + phone.slice(-4), phone } 
            };
            resolve();
          });
      } else {
        if (user.login_disabled) {
          ctx.status = 403;
          ctx.body = { error: '账号已被禁用' };
          resolve();
          return;
        }

        const token = jwt.sign({ userId: user.id, phone: user.phone }, JWT_SECRET, { expiresIn: '30d' });
        
        ctx.body = { 
          token, 
          user: { id: user.id, name: user.name, phone: user.phone, department: user.department, employeeNo: user.employee_no } 
        };
        resolve();
      }
    });
  });
});

router.post('/send-code', async (ctx) => {
  const { phone } = ctx.request.body;
  
  if (!phone) {
    ctx.status = 400;
    ctx.body = { error: '请输入手机号' };
    return;
  }

  ctx.body = { message: '验证码已发送（演示环境：任意6位数字）' };
});

router.get('/profile', async (ctx) => {
  const authHeader = ctx.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    ctx.status = 401;
    ctx.body = { error: '未登录' };
    return;
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    return new Promise((resolve) => {
      db.get("SELECT id, name, phone, department, employee_no FROM users WHERE id = ?", 
        [decoded.userId], (err, user) => {
          if (err || !user) {
            ctx.status = 404;
            ctx.body = { error: '用户不存在' };
            resolve();
            return;
          }
          ctx.body = { user };
          resolve();
        });
    });
  } catch (err) {
    ctx.status = 401;
    ctx.body = { error: '无效的令牌' };
  }
});

router.put('/profile', async (ctx) => {
  const authHeader = ctx.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    ctx.status = 401;
    ctx.body = { error: '未登录' };
    return;
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { name, department } = ctx.request.body;
    
    return new Promise((resolve) => {
      db.run("UPDATE users SET name = ?, department = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", 
        [name, department, decoded.userId], function(err) {
          if (err) {
            ctx.status = 500;
            ctx.body = { error: '更新失败' };
            resolve();
            return;
          }
          ctx.body = { message: '更新成功' };
          resolve();
        });
    });
  } catch (err) {
    ctx.status = 401;
    ctx.body = { error: '无效的令牌' };
  }
});

module.exports = router;
