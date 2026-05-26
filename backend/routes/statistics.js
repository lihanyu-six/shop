const Router = require('koa-router');
const { db } = require('../database');
const { authMiddleware } = require('../middleware/auth');

const router = new Router();

router.use(authMiddleware);

router.get('/today', async (ctx) => {
  const today = new Date().toISOString().split('T')[0];

  return new Promise((resolve) => {
    db.all("SELECT meal_type, COUNT(*) as count FROM orders WHERE order_date = ? AND status != 'cancelled' GROUP BY meal_type",
      [today], (err, rows) => {
        if (err) {
          ctx.status = 500;
          ctx.body = { code: 500, message: '查询失败', data: null };
          resolve();
          return;
        }

        const breakfastData = rows.find(r => r.meal_type === 'breakfast') || { count: 0 };
        const lunchData = rows.find(r => r.meal_type === 'lunch') || { count: 0 };
        const dinnerData = rows.find(r => r.meal_type === 'dinner') || { count: 0 };

        const totalCount = rows.reduce((sum, row) => sum + row.count, 0);

        ctx.body = {
          code: 200,
          message: 'success',
          data: {
            reservationCount: totalCount,
            breakfastSummary: {
              totalOrders: breakfastData.count,
              timeRange: '07:00-09:00'
            },
            lunchSummary: {
              totalOrders: lunchData.count,
              timeRange: '11:30-13:00'
            },
            dinnerSummary: {
              totalOrders: dinnerData.count,
              timeRange: '17:30-19:00'
            }
          }
        };
        resolve();
      });
  });
});

router.get('/orders', async (ctx) => {
  const { page = 1, pageSize = 10, keyword, mealType, department } = ctx.query;
  const offset = (parseInt(page) - 1) * parseInt(pageSize);

  let whereClause = "WHERE o.status != 'cancelled'";
  const params = [];

  if (keyword) {
    whereClause += " AND u.name LIKE ?";
    params.push(`%${keyword}%`);
  }

  if (mealType) {
    whereClause += " AND o.meal_type = ?";
    params.push(mealType);
  }

  if (department) {
    whereClause += " AND u.department LIKE ?";
    params.push(`%${department}%`);
  }

  return new Promise((resolve) => {
    db.get(`SELECT COUNT(*) as total FROM orders o LEFT JOIN users u ON o.user_id = u.id ${whereClause}`,
      params, (err, countRow) => {
        if (err) {
          ctx.status = 500;
          ctx.body = { code: 500, message: '查询失败', data: null };
          resolve();
          return;
        }

        const total = countRow.total;

        db.all(`SELECT o.id, u.name as userName, u.department, u.employee_no as employeeNo,
                o.meal_type as mealType, o.pick_code as pickCode, o.remark,
                datetime(o.created_at) as createdAt
                FROM orders o LEFT JOIN users u ON o.user_id = u.id
                ${whereClause} ORDER BY o.created_at DESC LIMIT ? OFFSET ?`,
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

          db.all(`SELECT order_id, dish_name, quantity, remark FROM order_items WHERE order_id IN (${placeholders})`,
            orderIds, (err, items) => {
              if (err) {
                ctx.status = 500;
                ctx.body = { code: 500, message: '查询失败', data: null };
                resolve();
                return;
              }

              const list = orders.map(order => {
                const orderItems = items
                  .filter(item => item.order_id === order.id)
                  .map(({ order_id, ...item }) => item);

                return {
                  id: order.id,
                  userName: order.userName,
                  department: order.department,
                  employeeNo: order.employeeNo,
                  mealType: order.mealType,
                  items: orderItems,
                  remark: order.remark || '',
                  pickCode: order.pickCode,
                  createdAt: order.createdAt
                };
              });

              ctx.body = {
                code: 200,
                message: 'success',
                data: { list, total, page: parseInt(page), pageSize: parseInt(pageSize) }
              };
              resolve();
            });
        });
      });
  });
});

router.get('/orders/export', async (ctx) => {
  const { keyword, mealType, department } = ctx.query;

  let whereClause = "WHERE o.status != 'cancelled'";
  const params = [];

  if (keyword) {
    whereClause += " AND u.name LIKE ?";
    params.push(`%${keyword}%`);
  }

  if (mealType) {
    whereClause += " AND o.meal_type = ?";
    params.push(mealType);
  }

  if (department) {
    whereClause += " AND u.department LIKE ?";
    params.push(`%${department}%`);
  }

  return new Promise((resolve) => {
    db.all(`SELECT o.id, u.name as userName, u.department, u.employee_no as employeeNo,
            o.meal_type as mealType, o.pick_code as pickCode, o.remark,
            datetime(o.created_at) as createdAt
            FROM orders o LEFT JOIN users u ON o.user_id = u.id
            ${whereClause} ORDER BY o.created_at DESC`,
    params, (err, orders) => {
      if (err) {
        ctx.status = 500;
        ctx.body = { code: 500, message: '导出失败', data: null };
        resolve();
        return;
      }

      if (orders.length === 0) {
        ctx.body = { code: 200, message: 'success', data: [] };
        resolve();
        return;
      }

      const orderIds = orders.map(o => o.id);
      const placeholders = orderIds.map(() => '?').join(',');

      db.all(`SELECT order_id, dish_name, quantity, remark FROM order_items WHERE order_id IN (${placeholders})`,
        orderIds, (err, items) => {
          if (err) {
            ctx.status = 500;
            ctx.body = { code: 500, message: '导出失败', data: null };
            resolve();
            return;
          }

          const list = orders.map(order => {
            const orderItems = items
              .filter(item => item.order_id === order.id)
              .map(({ order_id, ...item }) => item);

            return {
              id: order.id,
              userName: order.userName,
              department: order.department,
              employeeNo: order.employeeNo,
              mealType: order.mealType,
              items: orderItems,
              remark: order.remark || '',
              pickCode: order.pickCode,
              createdAt: order.createdAt
            };
          });

          ctx.body = { code: 200, message: 'success', data: list };
          resolve();
        });
    });
  });
});

module.exports = router;
