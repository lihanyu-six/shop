const Router = require('koa-router');
const { db } = require('../database');
const { authMiddleware } = require('../middleware/auth');

const router = new Router();

router.use(authMiddleware);

router.get('/categories', async (ctx) => {
  const { keyword } = ctx.query;

  let whereClause = 'WHERE 1=1';
  const params = [];

  if (keyword) {
    whereClause += ' AND name LIKE ?';
    params.push(`%${keyword}%`);
  }

  return new Promise((resolve) => {
    db.all(`SELECT * FROM dish_categories ${whereClause} ORDER BY sort_order, id`, params, (err, categories) => {
      if (err) {
        ctx.status = 500;
        ctx.body = { code: 500, message: '查询失败', data: null };
        resolve();
        return;
      }

      ctx.body = {
        code: 200,
        message: 'success',
        data: categories
      };
      resolve();
    });
  });
});

router.post('/categories', async (ctx) => {
  const { name, sortOrder = 0, showInDailyMenu = 1 } = ctx.request.body;

  if (!name) {
    ctx.status = 400;
    ctx.body = { code: 400, message: '请输入类别名称', data: null };
    return;
  }

  return new Promise((resolve) => {
    db.run("INSERT INTO dish_categories (name, sort_order, show_in_daily_menu) VALUES (?, ?, ?)",
      [name, sortOrder, showInDailyMenu ? 1 : 0], function(err) {
        if (err) {
          ctx.status = 500;
          ctx.body = { code: 500, message: '创建类别失败', data: null };
          resolve();
          return;
        }

        ctx.body = { code: 200, message: 'success', data: { id: this.lastID } };
        resolve();
      });
  });
});

router.put('/categories/:id', async (ctx) => {
  const { id } = ctx.params;
  const { name, sortOrder, showInDailyMenu } = ctx.request.body;

  return new Promise((resolve) => {
    const fields = [];
    const params = [];

    if (name !== undefined) { fields.push('name = ?'); params.push(name); }
    if (sortOrder !== undefined) { fields.push('sort_order = ?'); params.push(sortOrder); }
    if (showInDailyMenu !== undefined) { fields.push('show_in_daily_menu = ?'); params.push(showInDailyMenu ? 1 : 0); }

    if (fields.length === 0) {
      ctx.status = 400;
      ctx.body = { code: 400, message: '没有要更新的字段', data: null };
      resolve();
      return;
    }

    params.push(id);

    db.run(`UPDATE dish_categories SET ${fields.join(', ')} WHERE id = ?`, params, function(err) {
      if (err) {
        ctx.status = 500;
        ctx.body = { code: 500, message: '更新类别失败', data: null };
        resolve();
        return;
      }

      ctx.body = { code: 200, message: 'success', data: null };
      resolve();
    });
  });
});

router.delete('/categories/:id', async (ctx) => {
  const { id } = ctx.params;

  return new Promise((resolve) => {
    db.get("SELECT COUNT(*) as count FROM dishes WHERE category_id = ?", [id], (err, row) => {
      if (row && row.count > 0) {
        ctx.status = 400;
        ctx.body = { code: 400, message: '该类别下还有菜品，无法删除', data: null };
        resolve();
        return;
      }

      db.run("DELETE FROM dish_categories WHERE id = ?", [id], function(err) {
        if (err) {
          ctx.status = 500;
          ctx.body = { code: 500, message: '删除类别失败', data: null };
          resolve();
          return;
        }

        ctx.body = { code: 200, message: 'success', data: null };
        resolve();
      });
    });
  });
});

router.get('/', async (ctx) => {
  const { page = 1, pageSize = 10, keyword, categoryId, mealType } = ctx.query;
  const offset = (parseInt(page) - 1) * parseInt(pageSize);

  let whereClause = 'WHERE 1=1';
  const params = [];

  if (keyword) {
    whereClause += ' AND (d.name LIKE ? OR d.description LIKE ?)';
    params.push(`%${keyword}%`, `%${keyword}%`);
  }

  if (categoryId) {
    whereClause += ' AND d.category_id = ?';
    params.push(categoryId);
  }

  if (mealType) {
    whereClause += ' AND d.meal_type = ?';
    params.push(mealType);
  }

  return new Promise((resolve) => {
    db.get(`SELECT COUNT(*) as total FROM dishes d ${whereClause}`, params, (err, countRow) => {
      if (err) {
        ctx.status = 500;
        ctx.body = { code: 500, message: '查询失败', data: null };
        resolve();
        return;
      }

      const total = countRow.total;

      db.all(`SELECT d.*, dc.name as categoryName
              FROM dishes d 
              LEFT JOIN dish_categories dc ON d.category_id = dc.id 
              ${whereClause} ORDER BY d.id DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(pageSize), offset], (err, dishes) => {
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
            list: dishes,
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
  const { name, description, detailDescription, price, image, categoryId, mealType, status = 1 } = ctx.request.body;

  if (!name || !categoryId || !price) {
    ctx.status = 400;
    ctx.body = { code: 400, message: '请填写必填项（菜品名称、类别、价格）', data: null };
    return;
  }

  return new Promise((resolve) => {
    db.run("INSERT INTO dishes (name, description, detail_description, price, image, category_id, meal_type, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [name, description || '', detailDescription || '', price, image || '', categoryId, mealType || '', status], function(err) {
        if (err) {
          ctx.status = 500;
          ctx.body = { code: 500, message: '创建菜品失败', data: null };
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
  const { name, description, detailDescription, price, image, categoryId, mealType, status } = ctx.request.body;

  return new Promise((resolve) => {
    const fields = [];
    const params = [];

    if (name !== undefined) { fields.push('name = ?'); params.push(name); }
    if (description !== undefined) { fields.push('description = ?'); params.push(description); }
    if (detailDescription !== undefined) { fields.push('detail_description = ?'); params.push(detailDescription); }
    if (price !== undefined) { fields.push('price = ?'); params.push(price); }
    if (image !== undefined) { fields.push('image = ?'); params.push(image); }
    if (categoryId !== undefined) { fields.push('category_id = ?'); params.push(categoryId); }
    if (mealType !== undefined) { fields.push('meal_type = ?'); params.push(mealType); }
    if (status !== undefined) { fields.push('status = ?'); params.push(status); }

    if (fields.length === 0) {
      ctx.status = 400;
      ctx.body = { code: 400, message: '没有要更新的字段', data: null };
      resolve();
      return;
    }

    params.push(id);

    db.run(`UPDATE dishes SET ${fields.join(', ')} WHERE id = ?`, params, function(err) {
      if (err) {
        ctx.status = 500;
        ctx.body = { code: 500, message: '更新菜品失败', data: null };
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
    db.run("DELETE FROM daily_menu WHERE dish_id = ?", [id]);
    db.run("DELETE FROM order_items WHERE dish_id = ?", [id]);

    db.run("DELETE FROM dishes WHERE id = ?", [id], function(err) {
      if (err) {
        ctx.status = 500;
        ctx.body = { code: 500, message: '删除菜品失败', data: null };
        resolve();
        return;
      }

      ctx.body = { code: 200, message: 'success', data: null };
      resolve();
    });
  });
});

module.exports = router;
