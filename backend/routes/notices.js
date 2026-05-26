const Router = require('koa-router');
const { db } = require('../database');

const router = new Router();

router.get('/', async (ctx) => {
  return new Promise((resolve) => {
    db.all("SELECT * FROM notices WHERE status = 1 ORDER BY created_at DESC", [], (err, notices) => {
      if (err) {
        ctx.status = 500;
        ctx.body = { error: '查询失败' };
        resolve();
        return;
      }
      ctx.body = { notices };
      resolve();
    });
  });
});

router.get('/:id', async (ctx) => {
  const { id } = ctx.params;
  
  return new Promise((resolve) => {
    db.get("SELECT * FROM notices WHERE id = ?", [id], (err, notice) => {
      if (err) {
        ctx.status = 500;
        ctx.body = { error: '查询失败' };
        resolve();
        return;
      }
      if (!notice) {
        ctx.status = 404;
        ctx.body = { error: '公告不存在' };
        resolve();
        return;
      }
      ctx.body = { notice };
      resolve();
    });
  });
});

module.exports = router;
