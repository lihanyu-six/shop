const Router = require('koa-router');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
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

  const { mealType, orderDate, items, remark } = ctx.request.body;
  
  if (!mealType || !orderDate || !items || items.length === 0) {
    ctx.status = 400;
    ctx.body = { error: '参数不完整' };
    return;
  }

  return new Promise((resolve) => {
    const orderNo = 'ORD' + Date.now();
    const pickCode = Math.random().toString().slice(2, 8);
    
    let totalAmount = 0;
    items.forEach(item => {
      totalAmount += item.price * item.quantity;
    });

    db.run(`INSERT INTO orders (user_id, order_no, meal_type, order_date, pick_code, total_amount, remark, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
      [userId, orderNo, mealType, orderDate, pickCode, totalAmount, remark, 'confirmed'], 
      function(err) {
        if (err) {
          ctx.status = 500;
          ctx.body = { error: '创建订单失败' };
          resolve();
          return;
        }

        const orderId = this.lastID;
        const stmt = db.prepare("INSERT INTO order_items (order_id, dish_id, dish_name, price, quantity, remark) VALUES (?, ?, ?, ?, ?, ?)");
        
        items.forEach(item => {
          stmt.run(orderId, item.dishId, item.dishName, item.price, item.quantity, item.remark);
        });
        stmt.finalize();

        ctx.body = { order: { id: orderId, orderNo, pickCode, totalAmount } };
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

  const { status } = ctx.query;
  
  return new Promise((resolve) => {
    let query = "SELECT * FROM orders WHERE user_id = ?";
    const params = [userId];
    
    if (status) {
      query += " AND status = ?";
      params.push(status);
    }
    
    query += " ORDER BY created_at DESC";
    
    db.all(query, params, (err, orders) => {
      if (err) {
        ctx.status = 500;
        ctx.body = { error: '查询失败' };
        resolve();
        return;
      }

      if (orders.length === 0) {
        ctx.body = { orders: [] };
        resolve();
        return;
      }

      const orderIds = orders.map(o => o.id);
      const placeholders = orderIds.map(() => '?').join(',');
      
      db.all(`SELECT * FROM order_items WHERE order_id IN (${placeholders})`, orderIds, (err, items) => {
        if (err) {
          ctx.status = 500;
          ctx.body = { error: '查询失败' };
          resolve();
          return;
        }

        const ordersWithItems = orders.map(order => {
          const orderItems = items.filter(item => item.order_id === order.id);
          return { ...order, items: orderItems };
        });

        ctx.body = { orders: ordersWithItems };
        resolve();
      });
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
    db.get("SELECT * FROM orders WHERE id = ? AND user_id = ?", [id, userId], (err, order) => {
      if (err) {
        ctx.status = 500;
        ctx.body = { error: '查询失败' };
        resolve();
        return;
      }
      if (!order) {
        ctx.status = 404;
        ctx.body = { error: '订单不存在' };
        resolve();
        return;
      }
      
      db.all("SELECT * FROM order_items WHERE order_id = ?", [id], (err, items) => {
        if (err) {
          ctx.status = 500;
          ctx.body = { error: '查询失败' };
          resolve();
          return;
        }
        ctx.body = { order, items };
        resolve();
      });
    });
  });
});

router.put('/:id/cancel', async (ctx) => {
  const userId = getUserId(ctx);
  if (!userId) {
    ctx.status = 401;
    ctx.body = { error: '请先登录' };
    return;
  }

  const { id } = ctx.params;
  
  return new Promise((resolve) => {
    db.run("UPDATE orders SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?", 
      [id, userId], function(err) {
        if (err) {
          ctx.status = 500;
          ctx.body = { error: '取消失败' };
          resolve();
          return;
        }
        if (this.changes === 0) {
          ctx.status = 404;
          ctx.body = { error: '订单不存在或无法取消' };
          resolve();
          return;
        }
        ctx.body = { message: '取消成功' };
        resolve();
      });
  });
});

module.exports = router;
