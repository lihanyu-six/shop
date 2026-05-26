const Router = require('koa-router');
const { db } = require('../database');
const { authMiddleware } = require('../middleware/auth');

const router = new Router();

router.use(authMiddleware);

router.get('/admin/list', async (ctx) => {
  const { page = 1, pageSize = 10, status, startDate, endDate, keyword } = ctx.query;
  const offset = (parseInt(page) - 1) * parseInt(pageSize);

  let whereClause = 'WHERE 1=1';
  const params = [];

  if (status !== undefined && status !== '' && status !== '全部') {
    whereClause += ' AND s.status = ?';
    params.push(parseInt(status));
  }

  if (startDate) {
    whereClause += ' AND DATE(s.created_at) >= ?';
    params.push(startDate);
  }

  if (endDate) {
    whereClause += ' AND DATE(s.created_at) <= ?';
    params.push(endDate);
  }

  if (keyword) {
    whereClause += ' AND (s.title LIKE ? OR s.description LIKE ?)';
    params.push(`%${keyword}%`, `%${keyword}%`);
  }

  return new Promise((resolve) => {
    db.get(`SELECT COUNT(*) as total FROM surveys s ${whereClause}`, params, (err, countRow) => {
      if (err) {
        ctx.status = 500;
        ctx.body = { code: 500, message: '查询失败', data: null };
        resolve();
        return;
      }

      const total = countRow.total;

      db.all(`SELECT s.*, datetime(s.created_at) as createdAt,
              (SELECT COUNT(*) FROM survey_responses sr WHERE sr.survey_id = s.id) as participantCount
              FROM surveys s ${whereClause} ORDER BY s.created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(pageSize), offset], (err, surveys) => {
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
            list: surveys.map(s => ({
              ...s,
              questions: JSON.parse(s.questions),
              statusText: s.status === 1 ? '已发布' : '草稿'
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

router.get('/admin/:id/statistics', async (ctx) => {
  const { id } = ctx.params;

  return new Promise((resolve) => {
    db.get("SELECT * FROM surveys WHERE id = ?", [id], (err, survey) => {
      if (err || !survey) {
        ctx.status = err ? 500 : 404;
        ctx.body = { code: err ? 500 : 404, message: err ? '查询失败' : '问卷不存在', data: null };
        resolve();
        return;
      }

      const questions = JSON.parse(survey.questions);

      db.all("SELECT answers FROM survey_responses WHERE survey_id = ?", [id], (err, responses) => {
        if (err) {
          ctx.status = 500;
          ctx.body = { code: 500, message: '查询失败', data: null };
          resolve();
          return;
        }

        const statistics = questions.map(q => {
          const stats = { question: q.title, type: q.type, options: {} };
          
          if (q.type === 'radio' || q.type === 'checkbox') {
            q.options.forEach(opt => { stats.options[opt] = 0; });
            
            responses.forEach(r => {
              try {
                const answers = JSON.parse(r.answers);
                const answer = answers[q.id];
                if (answer) {
                  if (Array.isArray(answer)) {
                    answer.forEach(a => {
                      if (stats.options[a] !== undefined) stats.options[a]++;
                    });
                  } else if (stats.options[answer] !== undefined) {
                    stats.options[answer]++;
                  }
                }
              } catch (e) {}
            });
          } else if (q.type === 'text') {
            stats.answers = [];
            responses.forEach(r => {
              try {
                const answers = JSON.parse(r.answers);
                if (answers[q.id]) stats.answers.push(answers[q.id]);
              } catch (e) {}
            });
          }

          return stats;
        });

        ctx.body = {
          code: 200,
          message: 'success',
          data: {
            survey: { ...survey, questions },
            totalResponses: responses.length,
            statistics
          }
        };
        resolve();
      });
    });
  });
});

router.get('/admin/:id/export', async (ctx) => {
  const { id } = ctx.params;

  return new Promise((resolve) => {
    db.all(`SELECT sr.answers, u.name, u.department, u.employee_no, datetime(sr.created_at) as createdAt 
            FROM survey_responses sr 
            LEFT JOIN users u ON sr.user_id = u.id 
            WHERE sr.survey_id = ? ORDER BY sr.created_at DESC`, [id], (err, responses) => {
      if (err) {
        ctx.status = 500;
        ctx.body = { code: 500, message: '导出失败', data: null };
        resolve();
        return;
      }

      ctx.body = {
        code: 200,
        message: 'success',
        data: responses.map(r => ({ ...r, answers: JSON.parse(r.answers) }))
      };
      resolve();
    });
  });
});

router.post('/admin', async (ctx) => {
  const { title, description, questions, status = 0 } = ctx.request.body;

  if (!title || !questions) {
    ctx.status = 400;
    ctx.body = { code: 400, message: '标题和问题为必填项', data: null };
    return;
  }

  return new Promise((resolve) => {
    db.run("INSERT INTO surveys (title, description, questions, status) VALUES (?, ?, ?, ?)",
      [title, description || '', JSON.stringify(questions), status], function(err) {
        if (err) {
          ctx.status = 500;
          ctx.body = { code: 500, message: '创建问卷失败', data: null };
          resolve();
          return;
        }

        ctx.body = { code: 200, message: 'success', data: { id: this.lastID } };
        resolve();
      });
  });
});

router.put('/admin/:id', async (ctx) => {
  const { id } = ctx.params;
  const { title, description, questions, status } = ctx.request.body;

  return new Promise((resolve) => {
    const fields = [];
    const params = [];

    if (title !== undefined) { fields.push('title = ?'); params.push(title); }
    if (description !== undefined) { fields.push('description = ?'); params.push(description); }
    if (questions !== undefined) { fields.push('questions = ?'); params.push(JSON.stringify(questions)); }
    if (status !== undefined) { fields.push('status = ?'); params.push(status); }

    if (fields.length === 0) {
      ctx.status = 400;
      ctx.body = { code: 400, message: '没有要更新的字段', data: null };
      resolve();
      return;
    }

    params.push(id);

    db.run(`UPDATE surveys SET ${fields.join(', ')} WHERE id = ?`, params, function(err) {
      if (err) {
        ctx.status = 500;
        ctx.body = { code: 500, message: '更新问卷失败', data: null };
        resolve();
        return;
      }

      ctx.body = { code: 200, message: 'success', data: null };
      resolve();
    });
  });
});

router.delete('/admin/:id', async (ctx) => {
  const { id } = ctx.params;

  return new Promise((resolve) => {
    db.run("DELETE FROM surveys WHERE id = ?", [id], function(err) {
      if (err) {
        ctx.status = 500;
        ctx.body = { code: 500, message: '删除问卷失败', data: null };
        resolve();
        return;
      }

      db.run("DELETE FROM survey_responses WHERE survey_id = ?", [id]);

      ctx.body = { code: 200, message: 'success', data: null };
      resolve();
    });
  });
});

module.exports = router;
