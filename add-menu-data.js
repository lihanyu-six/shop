const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'canteen.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('正在添加每日菜单数据...');

const today = new Date().toISOString().split('T')[0];

db.serialize(() => {
  const stmt = db.prepare("INSERT OR REPLACE INTO daily_menu (date, meal_type, dish_id) VALUES (?, ?, ?)");
  
  console.log('添加早餐菜单...');
  stmt.run(today, 'breakfast', 5);
  stmt.run(today, 'breakfast', 6);
  
  console.log('添加午餐菜单...');
  stmt.run(today, 'lunch', 1);
  stmt.run(today, 'lunch', 2);
  stmt.run(today, 'lunch', 4);
  stmt.run(today, 'lunch', 5);
  stmt.run(today, 'lunch', 6);
  
  console.log('添加晚餐菜单...');
  stmt.run(today, 'dinner', 3);
  stmt.run(today, 'dinner', 4);
  stmt.run(today, 'dinner', 5);
  stmt.run(today, 'dinner', 6);
  
  stmt.finalize();

  db.all("SELECT * FROM daily_menu", [], (err, menu) => {
    if (err) {
      console.error('查询失败:', err);
    } else {
      console.log('\n每日菜单数据已添加:');
      console.log(menu);
    }
    db.close();
    console.log('\n完成！请刷新前端页面查看效果。');
  });
});
