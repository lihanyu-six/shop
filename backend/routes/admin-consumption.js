const Router = require('koa-router');
const { db } = require('../database');
const XLSX = require('xlsx');

const router = new Router();

router.get('/', async (ctx) => {
  const { page = 1, pageSize = 10, keyword } = ctx.query;
  const offset = (page - 1) * pageSize;

  let whereClause = '';
  let params = [];

  if (keyword) {
    whereClause = 'WHERE employee_no LIKE ?';
    params.push(`%${keyword}%`);
  }

  return new Promise((resolve) => {
    db.all(
      `SELECT * FROM consumption_records ${whereClause} ORDER BY id DESC LIMIT ? OFFSET?`,
      [...params, parseInt(pageSize), offset],
      (err, records) => {
        if (err) {
          ctx.status = 500;
          ctx.body = { code: 500, message: '查询失败' };
          resolve();
          return;
        }

        db.get(
          `SELECT COUNT(*) as total FROM consumption_records ${whereClause}`,
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
                list: records,
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

router.post('/import', async (ctx) => {
  if (!ctx.request.files || !ctx.request.files.file) {
    ctx.status = 400;
    ctx.body = { code: 400, message: '请上传文件' };
    return;
  }

  const file = ctx.request.files.file;

  try {
    const workbook = XLSX.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      ctx.status = 400;
      ctx.body = { code: 400, message: '文件中没有数据' };
      return;
    }

    const stmt = db.prepare(`INSERT INTO consumption_records (employee_no, card_no, user_name, department, consumption_time, amount, balance, serial_no, machine_no)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);

    let count = 0;
    for (const row of data) {
      stmt.run(
        row['工号'] || '',
        row['卡号'] || '',
        row['姓名'] || '',
        row['部门名称'] || '',
        row['消费时间'] || new Date().toISOString(),
        parseFloat(row['消费金额']) || 0,
        parseFloat(row['卡余额']) || 0,
        String(row['卡流水号'] || ''),
        String(row['机号'] || '')
      );
      count++;
    }

    stmt.finalize();

    ctx.body = {
      code: 200,
      data: { count }
    };
  } catch (error) {
    console.error('导入失败:', error);
    ctx.status = 500;
    ctx.body = { code: 500, message: '导入失败：' + error.message };
  }
});

module.exports = router;
