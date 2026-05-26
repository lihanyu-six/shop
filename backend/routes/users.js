const Router = require('koa-router');
const { db } = require('../database');
const { authMiddleware } = require('../middleware/auth');

const router = new Router();

router.use(authMiddleware);

router.get('/', async (ctx) => {
  const { page = 1, pageSize = 10, keyword, department } = ctx.query;
  const offset = (parseInt(page) - 1) * parseInt(pageSize);

  let whereClause = 'WHERE 1=1';
  const params = [];

  if (keyword) {
    whereClause += ' AND (name LIKE ? OR employee_no LIKE ? OR phone LIKE ?)';
    params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
  }

  if (department) {
    whereClause += ' AND department LIKE ?';
    params.push(`%${department}%`);
  }

  return new Promise((resolve) => {
    db.get(`SELECT COUNT(*) as total FROM users ${whereClause}`, params, (err, countRow) => {
      if (err) {
        ctx.status = 500;
        ctx.body = { code: 500, message: '查询失败', data: null };
        resolve();
        return;
      }

      const total = countRow.total;

      db.all(`SELECT id, name, department, employee_no as employeeNo, phone,
              login_disabled as loginDisabled, created_by as createdBy,
              datetime(created_at) as createdAt
              FROM users ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(pageSize), offset], (err, users) => {
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
            list: users.map(u => ({ ...u, loginDisabled: !!u.loginDisabled })),
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
  const { name, department, employeeNo, phone } = ctx.request.body;

  if (!name || !phone) {
    ctx.status = 400;
    ctx.body = { code: 400, message: '姓名和手机号为必填项', data: null };
    return;
  }

  return new Promise((resolve) => {
    db.run("INSERT INTO users (name, department, employee_no, phone, created_by) VALUES (?, ?, ?, ?, 'admin')",
      [name, department || '', employeeNo || '', phone], function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            ctx.status = 409;
            ctx.body = { code: 409, message: '手机号已存在', data: null };
          } else {
            ctx.status = 500;
            ctx.body = { code: 500, message: '创建用户失败', data: null };
          }
          resolve();
          return;
        }

        ctx.body = {
          code: 200,
          message: 'success',
          data: { id: this.lastID }
        };
        resolve();
      });
  });
});

router.put('/:id', async (ctx) => {
  const { id } = ctx.params;
  const { name, department, employeeNo, phone } = ctx.request.body;

  if (!name || !phone) {
    ctx.status = 400;
    ctx.body = { code: 400, message: '姓名和手机号为必填项', data: null };
    return;
  }

  return new Promise((resolve) => {
    db.run("UPDATE users SET name = ?, department = ?, employee_no = ?, phone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [name, department || '', employeeNo || '', phone, id], function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            ctx.status = 409;
            ctx.body = { code: 409, message: '手机号已存在', data: null };
          } else {
            ctx.status = 500;
            ctx.body = { code: 500, message: '更新用户失败', data: null };
          }
          resolve();
          return;
        }

        if (this.changes === 0) {
          ctx.status = 404;
          ctx.body = { code: 404, message: '用户不存在', data: null };
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
    db.run("DELETE FROM users WHERE id = ?", [id], function(err) {
      if (err) {
        ctx.status = 500;
        ctx.body = { code: 500, message: '删除用户失败', data: null };
        resolve();
        return;
      }

      if (this.changes === 0) {
        ctx.status = 404;
        ctx.body = { code: 404, message: '用户不存在', data: null };
        resolve();
        return;
      }

      ctx.body = { code: 200, message: 'success', data: null };
      resolve();
    });
  });
});

router.patch('/:id/status', async (ctx) => {
  const { id } = ctx.params;
  const { loginDisabled } = ctx.request.body;

  if (typeof loginDisabled !== 'boolean') {
    ctx.status = 400;
    ctx.body = { code: 400, message: 'loginDisabled 必须为布尔值', data: null };
    return;
  }

  return new Promise((resolve) => {
    db.run("UPDATE users SET login_disabled = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [loginDisabled ? 1 : 0, id], function(err) {
        if (err) {
          ctx.status = 500;
          ctx.body = { code: 500, message: '更新状态失败', data: null };
          resolve();
          return;
        }

        if (this.changes === 0) {
          ctx.status = 404;
          ctx.body = { code: 404, message: '用户不存在', data: null };
          resolve();
          return;
        }

        ctx.body = { code: 200, message: 'success', data: null };
        resolve();
      });
  });
});

router.post('/import', async (ctx) => {
  const { users } = ctx.request.body;

  if (!users || !Array.isArray(users) || users.length === 0) {
    ctx.status = 400;
    ctx.body = { code: 400, message: '请提供有效的用户数据', data: null };
    return;
  }

  let successCount = 0;
  let failCount = 0;

  return new Promise((resolve) => {
    const stmt = db.prepare("INSERT INTO users (name, department, employee_no, phone, created_by) VALUES (?, ?, ?, ?, 'admin')");

    users.forEach(user => {
      if (user.name && user.phone) {
        stmt.run(user.name, user.department || '', user.employeeNo || '', user.phone, (err) => {
          if (err) {
            failCount++;
          } else {
            successCount++;
          }
        });
      } else {
        failCount++;
      }
    });

    stmt.finalize((err) => {
      if (err) {
        ctx.status = 500;
        ctx.body = { code: 500, message: '导入失败', data: null };
        resolve();
        return;
      }

      ctx.body = {
        code: 200,
        message: 'success',
        data: { successCount, failCount }
      };
      resolve();
    });
  });
});

router.get('/export', async (ctx) => {
  return new Promise((resolve) => {
    db.all(`SELECT id, name, department, employee_no as employeeNo, phone,
            login_disabled as loginDisabled, created_by as createdBy,
            datetime(created_at) as createdAt
            FROM users ORDER BY created_at DESC`, (err, users) => {
      if (err) {
        ctx.status = 500;
        ctx.body = { code: 500, message: '导出失败', data: null };
        resolve();
        return;
      }

      ctx.body = {
        code: 200,
        message: 'success',
        data: users.map(u => ({ ...u, loginDisabled: !!u.loginDisabled }))
      };
      resolve();
    });
  });
});

module.exports = router;
