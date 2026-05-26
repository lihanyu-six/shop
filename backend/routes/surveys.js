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

router.get('/', async (ctx) => {
  return new Promise((resolve) => {
    db.all("SELECT * FROM surveys WHERE status = 1 ORDER BY created_at DESC", [], (err, surveys) => {
      if (err) {
        ctx.status = 500;
        ctx.body = { error: '查询失败' };
        resolve();
        return;
      }
      ctx.body = { surveys: surveys.map(s => ({ ...s, questions: JSON.parse(s.questions) })) };
      resolve();
    });
  });
});

router.get('/:id', async (ctx) => {
  const { id } = ctx.params;
  
  return new Promise((resolve) => {
    db.get("SELECT * FROM surveys WHERE id = ?", [id], (err, survey) => {
      if (err) {
        ctx.status = 500;
        ctx.body = { error: '查询失败' };
        resolve();
        return;
      }
      if (!survey) {
        ctx.status = 404;
        ctx.body = { error: '问卷不存在' };
        resolve();
        return;
      }
      ctx.body = { survey: { ...survey, questions: JSON.parse(survey.questions) } };
      resolve();
    });
  });
});

router.post('/:id/responses', async (ctx) => {
  const userId = getUserId(ctx);
  if (!userId) {
    ctx.status = 401;
    ctx.body = { error: '请先登录' };
    return;
  }

  const { id } = ctx.params;
  const { answers } = ctx.request.body;
  
  if (!answers) {
    ctx.status = 400;
    ctx.body = { error: '请填写问卷' };
    return;
  }

  return new Promise((resolve) => {
    db.run("INSERT INTO survey_responses (survey_id, user_id, answers) VALUES (?, ?, ?)", 
      [id, userId, JSON.stringify(answers)], 
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

router.get('/:id/my-response', async (ctx) => {
  const userId = getUserId(ctx);
  if (!userId) {
    ctx.status = 401;
    ctx.body = { error: '请先登录' };
    return;
  }

  const { id } = ctx.params;
  
  return new Promise((resolve) => {
    db.get("SELECT * FROM survey_responses WHERE survey_id = ? AND user_id = ?", [id, userId], (err, response) => {
      if (err) {
        ctx.status = 500;
        ctx.body = { error: '查询失败' };
        resolve();
        return;
      }
      ctx.body = { response: response ? { ...response, answers: JSON.parse(response.answers) } : null };
      resolve();
    });
  });
});

module.exports = router;
