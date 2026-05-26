const Router = require('koa-router');
const { db } = require('../database');

const router = new Router();

router.get('/', async (ctx) => {
  const { page = 1, pageSize = 10, keyword } = ctx.query;
  const offset = (page - 1) * pageSize;

  let whereClause = '';
  let params = [];

  if (keyword) {
    whereClause = 'WHERE type LIKE ? OR title LIKE ?';
    params.push(`%${keyword}%`, `%${keyword}%`);
  }

  return new Promise((resolve) => {
    db.all(
      `SELECT * FROM notices ${whereClause} ORDER BY id DESC LIMIT ? OFFSET?`,
      [...params, parseInt(pageSize), offset],
      (err, notices) => {
        if (err) {
          ctx.status = 500;
          ctx.body = { code: 500, message: '查询失败' };
          resolve();
          return;
        }

        db.get(
          `SELECT COUNT(*) as total FROM notices ${whereClause}`,
          params,
          (countErr, countRow) => {
            if (countErr) {
              ctx.status = 500;
              ctx.body = { code: 500, message: '查询失败' };
              resolve();
              return;
            }

            ctx.body = {
              code: 200,
              data: {
                list: notices,
                total: countRow.total
              }
            };
            resolve();
          }
        );
      }
    );
  });
});

router.post('/', async (ctx) => {
  const { title, content, type, image } = ctx.request.body;

  if (!title || !content || !type) {
    ctx.status = 400;
    ctx.body = { code: 400, message: '请填写完整信息' };
    return;
  }

  return new Promise((resolve) => {
    db.run(
      `INSERT INTO notices (title, content, type, image, status) VALUES (?, ?, ?, ?, 1)`,
      [title, content, type, image || ''],
      function(err) {
        if (err) {
          ctx.status = 500;
          ctx.body = { code: 500, message: '创建失败' };
          resolve();
          return;
        }

        ctx.body = {
          code: 200,
          data: { id: this.lastID },
          message: '创建成功'
        };
        resolve();
      }
    );
  });
});

router.put('/:id', async (ctx) => {
  const { id } = ctx.params;
  const { title, content, type, image } = ctx.request.body;

  if (!title || !content || !type) {
    ctx.status = 400;
    ctx.body = { code: 400, message: '请填写完整信息' };
    return;
  }

  return new Promise((resolve) => {
    db.run(
      `UPDATE notices SET title = ?, content = ?, type = ?, image = ? WHERE id = ?`,
      [title, content, type, image || '', id],
      function(err) {
        if (err) {
          ctx.status = 500;
          ctx.body = { code: 500, message: '更新失败' };
          resolve();
          return;
        }

        if (this.changes === 0) {
          ctx.status = 404;
          ctx.body = { code: 404, message: '公告不存在' };
          resolve();
          return;
        }

        ctx.body = {
          code: 200,
          message: '更新成功'
        };
        resolve();
      }
    );
  });
});

router.delete('/:id', async (ctx) => {
  const { id } = ctx.params;

  return new Promise((resolve) => {
    db.run(`DELETE FROM notices WHERE id =?`, [id], function(err) {
      if (err) {
        ctx.status = 500;
        ctx.body = { code: 500, message: '删除失败' };
        resolve();
        return;
      }

      if (this.changes === 0) {
        ctx.status = 404;
        ctx.body = { code: 404, message: '公告不存在' };
        resolve();
        return;
      }

      ctx.body = {
        code: 200,
        message: '删除成功'
      };
      resolve();
    });
  });
});

module.exports = router;
