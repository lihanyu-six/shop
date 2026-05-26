const Router = require('koa-router');
const { db } = require('../database');
const { authMiddleware } = require('../middleware/auth');

const router = new Router();

router.use(authMiddleware);

router.get('/admin/list', async (ctx) => {
  const { page = 1, pageSize = 10, keyword, feedbackType } = ctx.query;
  const offset = (parseInt(page) - 1) * parseInt(pageSize);

  let whereClause = 'WHERE 1=1';
  const params = [];

  if (keyword) {
    whereClause += ' AND (u.name LIKE ? OR u.department LIKE ? OR u.employee_no LIKE ? OR f.content LIKE ?)';
    params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
  }

  if (feedbackType) {
    whereClause += ' AND f.feedback_type = ?';
    params.push(feedbackType);
  }

  return new Promise((resolve) => {
    db.get(`SELECT COUNT(*) as total FROM feedback f LEFT JOIN users u ON f.user_id = u.id ${whereClause}`, params, (err, countRow) => {
      if (err) {
        ctx.status = 500;
        ctx.body = { code: 500, message: '查询失败', data: null };
        resolve();
        return;
      }

      const total = countRow.total;

      db.all(`SELECT f.id, f.feedback_type as feedbackType, f.content, f.images, 
              f.reply_status as replyStatus, f.reply_content as replyContent, f.reply_time as replyTime,
              datetime(f.created_at) as createdAt,
              u.name, u.department, u.employee_no as employeeNo
              FROM feedback f LEFT JOIN users u ON f.user_id = u.id 
              ${whereClause} ORDER BY f.created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(pageSize), offset], (err, feedbacks) => {
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
            list: feedbacks.map(f => ({
              ...f,
              images: f.images ? JSON.parse(f.images) : null
            })),
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

router.post('/admin/:id/reply', async (ctx) => {
  const { id } = ctx.params;
  const { replyContent } = ctx.request.body;

  if (!replyContent) {
    ctx.status = 400;
    ctx.body = { code: 400, message: '请输入回复内容', data: null };
    return;
  }

  return new Promise((resolve) => {
    db.run("UPDATE feedback SET reply_status = 1, reply_content = ?, reply_time = CURRENT_TIMESTAMP WHERE id = ?",
      [replyContent, id], function(err) {
        if (err) {
          ctx.status = 500;
          ctx.body = { code: 500, message: '回复失败', data: null };
          resolve();
          return;
        }

        if (this.changes === 0) {
          ctx.status = 404;
          ctx.body = { code: 404, message: '反馈不存在', data: null };
          resolve();
          return;
        }

        ctx.body = { code: 200, message: 'success', data: null };
        resolve();
      });
  });
});

module.exports = router;
