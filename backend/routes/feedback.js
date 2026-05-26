const Router = require('koa-router');
const jwt = require('jsonwebtoken');
const { db } = require('../database');
const { JWT_SECRET } = require('../middleware/auth');

const router = new Router();

function getUserId(ctx) {
  const authHeader = ctx.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  
  try {
    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.userId;
  } catch {
    return null;
  }
}

router.post('/', async (ctx) => {
  const userId = getUserId(ctx);
  if (!userId) {
    ctx.status = 401;
    ctx.body = { error: '请先登录' };
    return;
  }

  const { feedbackType, content, images } = ctx.request.body;
  
  if (!feedbackType || !content) {
    ctx.status = 400;
    ctx.body = { error: '请填写反馈类型和内容' };
    return;
  }

  return new Promise((resolve) => {
    db.run("INSERT INTO feedback (user_id, feedback_type, content, images) VALUES (?, ?, ?, ?)", 
      [userId, feedbackType, content, images ? JSON.stringify(images) : null], 
      function(err) {
        if (err) {
          ctx.status = 500;
          ctx.body = { error: '提交失败' };
          resolve();
          return;
        }
        ctx.body = { message: '提交成功', id: this.lastID };
        resolve();
      });
  });
});

router.get('/', async (ctx) => {
  const userId = getUserId(ctx);
  if (!userId) {
    ctx.status = 401;
    ctx.body = { error: '请先登录' };
    return;
  }

  return new Promise((resolve) => {
    db.all("SELECT * FROM feedback WHERE user_id = ? ORDER BY created_at DESC", [userId], (err, feedbacks) => {
      if (err) {
        ctx.status = 500;
        ctx.body = { error: '查询失败' };
        resolve();
        return;
      }
      ctx.body = { feedbacks: feedbacks.map(f => ({ ...f, images: f.images ? JSON.parse(f.images) : null })) };
      resolve();
    });
  });
});

router.get('/:id', async (ctx) => {
  const userId = getUserId(ctx);
  if (!userId) {
    ctx.status = 401;
    ctx.body = { error: '请先登录' };
    return;
  }

  const { id } = ctx.params;
  
  return new Promise((resolve) => {
    db.get("SELECT * FROM feedback WHERE id = ? AND user_id = ?", [id, userId], (err, feedback) => {
      if (err) {
        ctx.status = 500;
        ctx.body = { error: '查询失败' };
        resolve();
        return;
      }
      if (!feedback) {
        ctx.status = 404;
        ctx.body = { error: '反馈不存在' };
        resolve();
        return;
      }
      ctx.body = { feedback: { ...feedback, images: feedback.images ? JSON.parse(feedback.images) : null } };
      resolve();
    });
  });
});

module.exports = router;
