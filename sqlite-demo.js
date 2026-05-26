const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./demo.sqlite');

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT, email TEXT)");
  
  const stmt = db.prepare("INSERT INTO users (name, email) VALUES (?, ?)");
  stmt.run("张三", "zhangsan@example.com");
  stmt.run("李四", "lisi@example.com");
  stmt.finalize();

  db.each("SELECT id, name, email FROM users", (err, row) => {
    console.log(`${row.id}: ${row.name} - ${row.email}`);
  });
});

db.close();
console.log('数据库操作完成！');