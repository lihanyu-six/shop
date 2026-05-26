const Router = require('koa-router');
const { db } = require('../database');

const router = new Router();

router.get('/categories', async (ctx) => {
  return new Promise((resolve) => {
    db.all("SELECT * FROM dish_categories ORDER BY sort_order", [], (err, rows) => {
      if (err) {
        ctx.status = 500;
        ctx.body = { error: '查询失败' };
        resolve();
        return;
      }
      ctx.body = { categories: rows };
      resolve();
    });
  });
});

router.get('/', async (ctx) => {
  const { date, mealType, categoryId } = ctx.query;
  
  return new Promise((resolve) => {
    let query = `
      SELECT d.*, dc.name as category_name 
      FROM dishes d 
      LEFT JOIN dish_categories dc ON d.category_id = dc.id 
      WHERE d.status = 1
    `;
    const params = [];
    
    if (categoryId) {
      query += " AND d.category_id = ?";
      params.push(categoryId);
    }
    
    query += " ORDER BY dc.sort_order, d.id";
    
    db.all(query, params, (err, dishes) => {
      if (err) {
        ctx.status = 500;
        ctx.body = { error: '查询失败' };
        resolve();
        return;
      }
      ctx.body = { dishes };
      resolve();
    });
  });
});

router.get('/daily', async (ctx) => {
  const { date, mealType } = ctx.query;
  const today = date || new Date().toISOString().split('T')[0];
  const meal = mealType || 'lunch';
  
  return new Promise((resolve) => {
    const query = `
      SELECT d.*, dc.name as category_name 
      FROM daily_menu dm
      JOIN dishes d ON dm.dish_id = d.id
      LEFT JOIN dish_categories dc ON d.category_id = dc.id
      WHERE dm.date = ? AND dm.meal_type = ? AND d.status = 1
      ORDER BY dc.sort_order, d.id
    `;
    
    db.all(query, [today, meal], (err, dishes) => {
      if (err) {
        ctx.status = 500;
        ctx.body = { error: '查询失败' };
        resolve();
        return;
      }
      
      if (dishes.length === 0) {
        db.all(`SELECT d.*, dc.name as category_name 
                FROM dishes d 
                LEFT JOIN dish_categories dc ON d.category_id = dc.id 
                WHERE d.status = 1 
                ORDER BY dc.sort_order, d.id`, [], (err, allDishes) => {
          if (err) {
            ctx.status = 500;
            ctx.body = { error: '查询失败' };
            resolve();
            return;
          }
          ctx.body = { dishes: allDishes };
          resolve();
        });
      } else {
        ctx.body = { dishes };
        resolve();
      }
    });
  });
});

router.get('/specs/:dishId', async (ctx) => {
  const { dishId } = ctx.params;
  
  return new Promise((resolve) => {
    db.all("SELECT * FROM dish_specs WHERE dish_id = ? ORDER BY id", [dishId], (err, rows) => {
      if (err) {
        ctx.status = 500;
        ctx.body = { error: '查询失败' };
        resolve();
        return;
      }
      ctx.body = { specs: rows };
      resolve();
    });
  });
});

router.get('/:id', async (ctx) => {
  const { id } = ctx.params;
  
  return new Promise((resolve) => {
    db.get(`SELECT d.*, dc.name as category_name 
            FROM dishes d 
            LEFT JOIN dish_categories dc ON d.category_id = dc.id 
            WHERE d.id = ?`, [id], (err, dish) => {
      if (err) {
        ctx.status = 500;
        ctx.body = { error: '查询失败' };
        resolve();
        return;
      }
      if (!dish) {
        ctx.status = 404;
        ctx.body = { error: '菜品不存在' };
        resolve();
        return;
      }
      ctx.body = { dish };
      resolve();
    });
  });
});

module.exports = router;
