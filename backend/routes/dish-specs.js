const Router = require('koa-router');
const { db } = require('../database');
const { authMiddleware } = require('../middleware/auth');

const router = new Router();

router.use(authMiddleware);

router.get('/', async (ctx) => {
  const { page = 1, pageSize = 10, keyword, dishId } = ctx.query;
  const offset = (parseInt(page) - 1) * parseInt(pageSize);

  let whereClause = 'WHERE 1=1';
  const params = [];

  if (keyword) {
    whereClause += ' AND (d.name LIKE ? OR ds.spec_name LIKE ? OR ds.spec_content LIKE ?)';
    params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
  }

  if (dishId) {
    whereClause += ' AND ds.dish_id = ?';
    params.push(dishId);
  }

  return new Promise((resolve) => {
    db.get(`SELECT COUNT(*) as total FROM dish_specs ds 
            LEFT JOIN dishes d ON ds.dish_id = d.id ${whereClause}`, params, (err, countRow) => {
      if (err) {
        ctx.status = 500;
        ctx.body = { code: 500, message: '查询失败', data: null };
        resolve();
        return;
      }

      const total = countRow.total;

      db.all(`SELECT ds.*, d.name as dishName
              FROM dish_specs ds 
              LEFT JOIN dishes d ON ds.dish_id = d.id 
              ${whereClause} ORDER BY ds.id DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(pageSize), offset], (err, specs) => {
        if (err) {
          ctx.status = 500;
          ctx.body = { code: 500, message: '查询失败', data: null };
          resolve();
          return;
        }

        ctx.body = {
          code: 200,
          message: 'success',
          data: {
            list: specs,
            total,
            page: parseInt(page),
            pageSize: parseInt(pageSize)
          }
        };
        resolve();
      });
    });
  });
});

router.post('/', async (ctx) => {
  const { dishId, specName, specContent } = ctx.request.body;

  if (!dishId || !specName || !specContent) {
    ctx.status = 400;
    ctx.body = { code: 400, message: '请填写完整信息', data: null };
    return;
  }

  return new Promise((resolve) => {
    db.run("INSERT INTO dish_specs (dish_id, spec_name, spec_content) VALUES (?, ?, ?)",
      [dishId, specName, specContent], function(err) {
        if (err) {
          ctx.status = 500;
          ctx.body = { code: 500, message: '创建规格失败', data: null };
          resolve();
          return;
        }

        ctx.body = { code: 200, message: 'success', data: { id: this.lastID } };
        resolve();
      });
  });
});

router.put('/:id', async (ctx) => {
  const { id } = ctx.params;
  const { specName, specContent } = ctx.request.body;

  return new Promise((resolve) => {
    db.run("UPDATE dish_specs SET spec_name = ?, spec_content = ? WHERE id = ?",
      [specName, specContent, id], function(err) {
        if (err) {
          ctx.status = 500;
          ctx.body = { code: 500, message: '更新规格失败', data: null };
          resolve();
          return;
        }

        if (this.changes === 0) {
          ctx.status = 404;
          ctx.body = { code: 404, message: '规格记录不存在', data: null };
          resolve();
          return;
        }

        ctx.body = { code: 200, message: 'success', data: null };
        resolve();
      });
  });
});

router.delete('/:id', async (ctx) => {
  const { id } = ctx.params;

  return new Promise((resolve) => {
    db.run("DELETE FROM dish_specs WHERE id = ?", [id], function(err) {
      if (err) {
        ctx.status = 500;
        ctx.body = { code: 500, message: '删除规格失败', data: null };
        resolve();
        return;
      }

      if (this.changes === 0) {
        ctx.status = 404;
        ctx.body = { code: 404, message: '规格记录不存在', data: null };
        resolve();
        return;
      }

      ctx.body = { code: 200, message: 'success', data: null };
      resolve();
    });
  });
});

module.exports = router;
