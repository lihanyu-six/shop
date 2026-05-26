const Router = require('koa-router');
const { db } = require('../database');
const { authMiddleware } = require('../middleware/auth');

const router = new Router();

router.use(authMiddleware);

router.get('/list', async (ctx) => {
  const { page = 1, pageSize = 10, keyword } = ctx.query;
  const offset = (parseInt(page) - 1) * parseInt(pageSize);

  let whereClause = 'WHERE 1=1';
  const params = [];

  if (keyword) {
    whereClause += ' AND r.category LIKE ?';
    params.push(`%${keyword}%`);
  }

  return new Promise((resolve) => {
    db.get(`SELECT COUNT(*) as total FROM reservations r ${whereClause}`, params, (err, countRow) => {
      if (err) {
        ctx.status = 500;
        ctx.body = { code: 500, message: '查询失败', data: null };
        resolve();
        return;
      }

      const total = countRow.total;

      db.all(`SELECT r.*, datetime(r.created_at) as createdAt, datetime(r.updated_at) as updatedAt
              FROM reservations r ${whereClause} ORDER BY r.created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(pageSize), offset], (err, reservations) => {
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
            list: reservations,
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
  const { category, timeSlot, startTime, endTime, createdBy = 'admin' } = ctx.request.body;

  if (!category || !timeSlot || !startTime || !endTime) {
    ctx.status = 400;
    ctx.body = { code: 400, message: '请填写完整信息', data: null };
    return;
  }

  return new Promise((resolve) => {
    db.run("INSERT INTO reservations (category, time_slot, start_time, end_time, created_by) VALUES (?, ?, ?, ?, ?)",
      [category, timeSlot, startTime, endTime, createdBy], function(err) {
        if (err) {
          ctx.status = 500;
          ctx.body = { code: 500, message: '创建预约失败', data: null };
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
  const { category, timeSlot, startTime, endTime } = ctx.request.body;

  return new Promise((resolve) => {
    db.run("UPDATE reservations SET category = ?, time_slot = ?, start_time = ?, end_time = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [category, timeSlot, startTime, endTime, id], function(err) {
        if (err) {
          ctx.status = 500;
          ctx.body = { code: 500, message: '更新预约失败', data: null };
          resolve();
          return;
        }

        if (this.changes === 0) {
          ctx.status = 404;
          ctx.body = { code: 404, message: '预约记录不存在', data: null };
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
    db.run("DELETE FROM reservations WHERE id = ?", [id], function(err) {
      if (err) {
        ctx.status = 500;
        ctx.body = { code: 500, message: '删除预约失败', data: null };
        resolve();
        return;
      }

      if (this.changes === 0) {
        ctx.status = 404;
        ctx.body = { code: 404, message: '预约记录不存在', data: null };
        resolve();
        return;
      }

      ctx.body = { code: 200, message: 'success', data: null };
      resolve();
    });
  });
});

router.get('/settings', async (ctx) => {
  return new Promise((resolve) => {
    db.all("SELECT * FROM reservation_settings ORDER BY meal_type, id", [], (err, settings) => {
      if (err) {
        ctx.status = 500;
        ctx.body = { code: 500, message: '查询设置失败', data: null };
        resolve();
        return;
      }

      ctx.body = {
        code: 200,
        message: 'success',
        data: settings
      };
      resolve();
    });
  });
});

router.post('/settings', async (ctx) => {
  const { settings } = ctx.request.body;

  if (!settings || !Array.isArray(settings)) {
    ctx.status = 400;
    ctx.body = { code: 400, message: '请提供设置数据', data: null };
    return;
  }

  return new Promise((resolve) => {
    db.run("DELETE FROM reservation_settings", [], (err) => {
      if (err) {
        ctx.status = 500;
        ctx.body = { code: 500, message: '保存设置失败', data: null };
        resolve();
        return;
      }

      const stmt = db.prepare("INSERT INTO reservation_settings (meal_type, advance_days, start_time, end_time) VALUES (?, ?, ?, ?)");
      
      settings.forEach(s => {
        stmt.run(s.mealType, s.advanceDays || '当日', s.startTime, s.endTime);
      });

      stmt.finalize((err) => {
        if (err) {
          ctx.status = 500;
          ctx.body = { code: 500, message: '保存设置失败', data: null };
          resolve();
          return;
        }

        ctx.body = { code: 200, message: 'success', data: null };
        resolve();
      });
    });
  });
});

module.exports = router;
