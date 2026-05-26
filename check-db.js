const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'canteen.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('检查数据库内容...');

db.all("SELECT * FROM dishes", [], (err, dishes) => {
  console.log('\n菜品:');
  console.log(dishes);
});

db.all("SELECT * FROM daily_menu", [], (err, menu) => {
  console.log('\n每日菜单:');
  console.log(menu);
  db.close();
});
