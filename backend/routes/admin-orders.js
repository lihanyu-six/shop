const Router = require('koa-router');
const { db } = require('../database');
const { authMiddleware } = require('../middleware/auth');

const router = new Router();

router.use(authMiddleware);

// 获取订单列表
router.get('/list', async (ctx) => {
  const { page = 1, pageSize = 10, keyword, status, mealType, orderDate } = ctx.query;
  const offset = (parseInt(page) - 1) * parseInt(pageSize);

  let whereClause = 'WHERE 1=1';
  const params = [];

  if (keyword) {
    whereClause += ' AND (u.name LIKE ? OR u.employee_no LIKE ? OR o.order_no LIKE ? OR o.pick_code LIKE ?)';
    params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
  }

  if (status) {
    whereClause += ' AND o.status = ?';
    params.push(status);
  }

  if (mealType) {
    whereClause += ' AND o.meal_type = ?';
    params.push(mealType);
  }

  if (orderDate) {
    whereClause += ' AND o.order_date = ?';
    params.push(orderDate);
  }

  return new Promise((resolve) => {
    db.get(`SELECT COUNT(*) as total FROM orders o LEFT JOIN users u ON o.user_id = u.id ${whereClause}`, params, (err, countRow) => {
      if (err) {
        ctx.status = 500;
        ctx.body = { code: 500, message: '查询失败', data: null };
        resolve();
        return;
      }

      const total = countRow.total;

      db.all(`SELECT o.*, u.name as user_name, u.department, u.employee_no,
              datetime(o.created_at) as createdAt, datetime(o.updated_at) as updatedAt
              FROM orders o LEFT JOIN users u ON o.user_id = u.id ${whereClause}
              ORDER BY o.created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(pageSize), offset], (err, orders) => {
        if (err) {
          ctx.status = 500;
          ctx.body = { code: 500, message: '查询失败', data: null };
          resolve();
          return;
        }

        if (orders.length === 0) {
          ctx.body = {
            code: 200,
            message: 'success',
            data: { list: [], total, page: parseInt(page), pageSize: parseInt(pageSize) }
          };
          resolve();
          return;
        }

        const orderIds = orders.map(o => o.id);
        const placeholders = orderIds.map(() => '?').join(',');

        db.all(`SELECT oi.*, d.image FROM order_items oi LEFT JOIN dishes d ON oi.dish_id = d.id WHERE oi.order_id IN (${placeholders})`, orderIds, (err, items) => {
          if (err) {
            ctx.status = 500;
            ctx.body = { code: 500, message: '查询失败', data: null };
            resolve();
            return;
          }

          const ordersWithItems = orders.map(order => {
            const orderItems = items.filter(item => item.order_id === order.id);
            return { ...order, items: orderItems };
          });

          ctx.body = {
            code: 200,
            message: 'success',
            data: {
              list: ordersWithItems,
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
});

// 获取订单详情
router.get('/:id', async (ctx) => {
  const { id } = ctx.params;

  return new Promise((resolve) => {
    db.get(`SELECT o.*, u.name as user_name, u.department, u.employee_no,
            datetime(o.created_at) as createdAt, datetime(o.updated_at) as updatedAt
            FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE o.id = ?`, [id], (err, order) => {
      if (err) {
        ctx.status = 500;
        ctx.body = { code: 500, message: '查询失败', data: null };
        resolve();
        return;
      }
      if (!order) {
        ctx.status = 404;
        ctx.body = { code: 404, message: '订单不存在', data: null };
        resolve();
        return;
      }

      db.all(`SELECT oi.*, d.image FROM order_items oi LEFT JOIN dishes d ON oi.dish_id = d.id WHERE oi.order_id = ?`, [id], (err, items) => {
        if (err) {
          ctx.status = 500;
          ctx.body = { code: 500, message: '查询失败', data: null };
          resolve();
          return;
        }
        ctx.body = { code: 200, message: 'success', data: { ...order, items } };
        resolve();
      });
    });
  });
});

// 更新订单状态
router.put('/:id/status', async (ctx) => {
  const { id } = ctx.params;
  const { status } = ctx.request.body;

  if (!status) {
    ctx.status = 400;
    ctx.body = { code: 400, message: '请提供订单状态', data: null };
    return;
  }

  return new Promise((resolve) => {
    db.run("UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [status, id], function(err) {
        if (err) {
          ctx.status = 500;
          ctx.body = { code: 500, message: '更新失败', data: null };
          resolve();
          return;
        }

        if (this.changes === 0) {
          ctx.status = 404;
          ctx.body = { code: 404, message: '订单不存在', data: null };
          resolve();
          return;
        }

        ctx.body = { code: 200, message: 'success', data: null };
        resolve();
      });
  });
});

module.exports = router;
