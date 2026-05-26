const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../canteen.sqlite');
const db = new sqlite3.Database(dbPath);

function initDatabase() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      department TEXT,
      employee_no TEXT,
      password TEXT,
      login_disabled INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS dish_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS dishes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      image TEXT,
      category_id INTEGER,
      status INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES dish_categories(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS daily_menu (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      meal_type TEXT NOT NULL,
      dish_id INTEGER NOT NULL,
      FOREIGN KEY (dish_id) REFERENCES dishes(id),
      UNIQUE(date, meal_type, dish_id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      order_no TEXT UNIQUE NOT NULL,
      meal_type TEXT NOT NULL,
      order_date TEXT NOT NULL,
      pick_code TEXT,
      total_amount REAL DEFAULT 0,
      status TEXT DEFAULT 'pending',
      remark TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      dish_id INTEGER NOT NULL,
      dish_name TEXT NOT NULL,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      remark TEXT,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (dish_id) REFERENCES dishes(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      feedback_type TEXT NOT NULL,
      content TEXT NOT NULL,
      images TEXT,
      reply_status INTEGER DEFAULT 0,
      reply_content TEXT,
      reply_time DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS surveys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      questions TEXT NOT NULL,
      status INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS survey_responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      survey_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      answers TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (survey_id) REFERENCES surveys(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS notices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      type TEXT,
      status INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    console.log('数据库初始化完成');

    insertSampleData();
  });
}

function insertSampleData() {
  db.get("SELECT COUNT(*) as count FROM dish_categories", (err, row) => {
    if (row.count === 0) {
      const stmt = db.prepare("INSERT INTO dish_categories (name, sort_order) VALUES (?, ?)");
      stmt.run("热菜", 1);
      stmt.run("凉菜", 2);
      stmt.run("主食", 3);
      stmt.run("汤品", 4);
      stmt.finalize();
    }
  });

  db.get("SELECT COUNT(*) as count FROM dishes", (err, row) => {
    if (row.count === 0) {
      const stmt = db.prepare("INSERT INTO dishes (name, description, price, category_id, image) VALUES (?, ?, ?, ?, ?)");
      stmt.run("红烧肉", "肥而不腻，入口即化", 28.00, 1, "https://images.unsplash.com/photo-1623595119708-26b1f7300075?w=300&h=300&fit=crop");
      stmt.run("宫保鸡丁", "经典川菜，鲜香麻辣", 22.00, 1, "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=300&h=300&fit=crop");
      stmt.run("清炒时蔬", "新鲜时令蔬菜", 12.00, 1, "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=300&fit=crop");
      stmt.run("凉拌黄瓜", "清爽开胃", 8.00, 2, "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=300&h=300&fit=crop");
      stmt.run("白米饭", "东北优质大米", 2.00, 3, "https://images.unsplash.com/photo-1536304993881-ff6e9eefa256?w=300&h=300&fit=crop");
      stmt.run("番茄蛋汤", "营养美味", 6.00, 4, "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=300&h=300&fit=crop");
      stmt.finalize();
    }
  });

  db.get("SELECT COUNT(*) as count FROM notices", (err, row) => {
    if (row.count === 0) {
      const stmt = db.prepare("INSERT INTO notices (title, content, type) VALUES (?, ?, ?)");
      stmt.run("食堂上新公告", "本周新增多款菜品，欢迎品尝！", "公告");
      stmt.run("营业时间调整", "春节期间营业时间调整为：早餐7:00-9:00，午餐11:30-13:00", "通知");
      stmt.finalize();
    }
  });

  db.get("SELECT COUNT(*) as count FROM surveys", (err, row) => {
    if (row.count === 0) {
      const questions = JSON.stringify([
        { id: 1, type: 'radio', title: '您对食堂菜品口味满意吗？', options: ['非常满意', '满意', '一般', '不满意'] },
        { id: 2, type: 'checkbox', title: '您最喜欢的菜品类型是？', options: ['热菜', '凉菜', '主食', '汤品'] },
        { id: 3, type: 'text', title: '您有什么建议？' }
      ]);
      db.run("INSERT INTO surveys (title, description, questions, status) VALUES (?, ?, ?, ?)", 
        ["食堂满意度调查", "请您抽出宝贵时间填写这份问卷，帮助我们提升服务质量", questions, 1]);
    }
  });

  db.get("SELECT COUNT(*) as count FROM daily_menu", (err, row) => {
    if (row.count === 0) {
      const today = new Date().toISOString().split('T')[0];
      const stmt = db.prepare("INSERT INTO daily_menu (date, meal_type, dish_id) VALUES (?, ?, ?)");
      
      stmt.run(today, 'breakfast', 5);
      stmt.run(today, 'breakfast', 6);
      stmt.run(today, 'lunch', 1);
      stmt.run(today, 'lunch', 2);
      stmt.run(today, 'lunch', 4);
      stmt.run(today, 'lunch', 5);
      stmt.run(today, 'lunch', 6);
      stmt.run(today, 'dinner', 3);
      stmt.run(today, 'dinner', 4);
      stmt.run(today, 'dinner', 5);
      stmt.run(today, 'dinner', 6);
      stmt.finalize();
      
      console.log('每日菜单示例数据已插入');
    }
  });
}

module.exports = { db, initDatabase };
