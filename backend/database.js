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
      created_by TEXT,
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
      sort_order INTEGER DEFAULT 0,
      show_in_daily_menu INTEGER DEFAULT 1,
      created_by TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS dishes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      detail_description TEXT,
      price REAL NOT NULL,
      image TEXT,
      category_id INTEGER,
      meal_type TEXT,
      status INTEGER DEFAULT 1,
      created_by TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES dish_categories(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS dish_specs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dish_id INTEGER NOT NULL,
      spec_name TEXT NOT NULL,
      spec_content TEXT NOT NULL,
      created_by TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (dish_id) REFERENCES dishes(id)
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

    db.run(`CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      time_slot TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      created_by TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS reservation_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      meal_type TEXT NOT NULL,
      advance_days TEXT DEFAULT '当日',
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS consumption_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      employee_no TEXT,
      card_no TEXT,
      user_name TEXT,
      department TEXT,
      consumption_time DATETIME,
      amount REAL,
      balance REAL,
      serial_no TEXT,
      machine_no TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
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

  db.get("SELECT COUNT(*) as count FROM admins", (err, row) => {
    if (row.count === 0) {
      db.run("INSERT INTO admins (username, password, name) VALUES (?, ?, ?)",
        ['admin', '123456', '系统管理员']);
      console.log('默认管理员账号已创建: admin / 123456');
    }
  });

  db.get("SELECT COUNT(*) as count FROM users WHERE employee_no IS NOT NULL AND employee_no != ''", (err, row) => {
    if (row.count === 0) {
      const testUsers = [
        { name: '张三', department: '技术部', employeeNo: 'EMP001', phone: '13800138001' },
        { name: '李四', department: '市场部', employeeNo: 'EMP002', phone: '13800138002' },
        { name: '王五', department: '财务部', employeeNo: 'EMP003', phone: '13800138003' },
        { name: '赵六', department: '人事部', employeeNo: 'EMP004', phone: '13800138004' },
        { name: '钱七', department: '技术部', employeeNo: 'EMP005', phone: '13800138005' },
        { name: '孙八', department: '市场部', employeeNo: 'EMP006', phone: '13800138006' },
        { name: '周九', department: '财务部', employeeNo: 'EMP007', phone: '13800138007' },
        { name: '吴十', department: '技术部', employeeNo: 'EMP008', phone: '13800138008' },
        { name: '郑十一', department: '人事部', employeeNo: 'EMP009', phone: '13800138009' },
        { name: '王十二', department: '市场部', employeeNo: 'EMP010', phone: '13800138010' },
        { name: '冯十三', department: '财务部', employeeNo: 'EMP011', phone: '13800138011' },
        { name: '陈十四', department: '技术部', employeeNo: 'EMP012', phone: '13800138012' }
      ];

      const stmt = db.prepare("INSERT INTO users (name, department, employee_no, phone, created_by) VALUES (?, ?, ?, ?, 'admin')");
      testUsers.forEach(user => stmt.run(user.name, user.department, user.employeeNo, user.phone));
      stmt.finalize();
      console.log('测试用户数据已插入');
    }
  });

  db.get("SELECT COUNT(*) as count FROM orders WHERE order_date = ?", [new Date().toISOString().split('T')[0]], (err, row) => {
    if (row.count === 0) {
      const today = new Date().toISOString().split('T')[0];
      const dishes = [
        { id: 1, name: '红烧肉', price: 28 },
        { id: 2, name: '宫保鸡丁', price: 22 },
        { id: 3, name: '清炒时蔬', price: 12 },
        { id: 4, name: '凉拌黄瓜', price: 8 },
        { id: 5, name: '白米饭', price: 2 },
        { id: 6, name: '番茄蛋汤', price: 6 }
      ];

      const pickCodes = [];
      for (let i = 0; i < 50; i++) {
        pickCodes.push(String.fromCharCode(65 + Math.floor(i / 1000)) + String(i % 1000).padStart(3, '0'));
      }

      let orderIndex = 0;

      for (let userId = 1; userId <= 12; userId++) {
        const meals = ['breakfast', 'lunch'];
        meals.forEach(mealType => {
          const orderNo = 'ORD' + Date.now() + orderIndex;
          const pickCode = pickCodes[orderIndex] || ('A' + String(orderIndex).padStart(3, '0'));

          let items;
          let totalAmount;

          if (mealType === 'breakfast') {
            items = [{ dishId: 5, dishName: '白米饭', price: 2, quantity: 1 }, { dishId: 6, dishName: '番茄蛋汤', price: 6, quantity: 1 }];
            totalAmount = 8;
          } else {
            items = [{ dishId: 1, dishName: '红烧肉', price: 28, quantity: 1 }, { dishId: 4, dishName: '凉拌黄瓜', price: 8, quantity: 1 }, { dishId: 5, dishName: '白米饭', price: 2, quantity: 1 }];
            totalAmount = 38;
          }

          db.run(`INSERT INTO orders (user_id, order_no, meal_type, order_date, pick_code, total_amount, status)
                  VALUES (?, ?, ?, ?, ?, ?, 'confirmed')`,
            [userId, orderNo, mealType, today, pickCode, totalAmount], function(err) {
              if (!err && this.lastID) {
                const orderId = this.lastID;
                const itemStmt = db.prepare("INSERT INTO order_items (order_id, dish_id, dish_name, price, quantity) VALUES (?, ?, ?, ?, ?)");
                items.forEach(item => itemStmt.run(orderId, item.dishId, item.dishName, item.price, item.quantity));
                itemStmt.finalize();
              }
            });

          orderIndex++;
        });
      }

      console.log('测试订单数据已插入');
    }
  });

  db.get("SELECT COUNT(*) as count FROM feedback", (err, row) => {
    if (row.count === 0) {
      const stmt = db.prepare("INSERT INTO feedback (user_id, feedback_type, content, reply_status, created_at) VALUES (?, ?, ?, ?, datetime('now', '-' || (abs(random()) % 30) || ' days'))");
      const feedbackTypes = ['类型1', '类型2', '类型3'];
      const contents = [
        '12345678994566123',
        '菜品味道不错，但是分量有点少',
        '希望增加更多素食选项',
        '排队时间太长了，希望能优化流程',
        '食堂环境很好，继续保持'
      ];
      
      for (let i = 1; i <= 10; i++) {
        const userId = (i % 12) + 1;
        const typeIndex = (i - 1) % feedbackTypes.length;
        const contentIndex = (i - 1) % contents.length;
        const replyStatus = i <= 7 ? 1 : 0;
        
        stmt.run(userId, feedbackTypes[typeIndex], contents[contentIndex], replyStatus);
      }
      stmt.finalize();
      
      db.run("UPDATE feedback SET reply_content = '感谢您的反馈，我们会尽快处理。', reply_time = datetime(created_at, '+1 hour') WHERE reply_status = 1");
      console.log('测试反馈数据已插入');
    }
  });

  db.get("SELECT COUNT(*) as count FROM reservations", (err, row) => {
    if (row.count === 0) {
      const stmt = db.prepare("INSERT INTO reservations (category, time_slot, start_time, end_time, created_by, created_at) VALUES (?, ?, ?, ?, 'admin', datetime('now', '-' || (abs(random()) % 5) || ' days'))");
      const categories = ['早餐', '午餐', '晚餐'];
      const slots = ['前一天', '当日', '当日'];
      
      for (let i = 0; i < 6; i++) {
        const catIndex = i % categories.length;
        stmt.run(categories[catIndex], slots[catIndex], '12:00', '17:00');
      }
      stmt.finalize();
      console.log('测试预约数据已插入');
    }
  });

  db.get("SELECT COUNT(*) as count FROM reservation_settings", (err, row) => {
    if (row.count === 0) {
      const stmt = db.prepare("INSERT INTO reservation_settings (meal_type, advance_days, start_time, end_time) VALUES (?, ?, ?, ?)");
      stmt.run('早餐', '前一天', '12:00', '17:00');
      stmt.run('中餐', '当日', '08:00', '11:00');
      stmt.run('晚餐', '当日', '14:00', '17:00');
      stmt.finalize();
      console.log('预约设置数据已插入');
    }
  });

  db.get("SELECT COUNT(*) as count FROM consumption_records", (err, row) => {
    if (row.count === 0) {
      const stmt = db.prepare(`INSERT INTO consumption_records (user_id, employee_no, card_no, user_name, department, consumption_time, amount, balance, serial_no, machine_no)
        VALUES (?, ?, ?, ?, ?, datetime('now', '-' || (abs(random()) % 7) || ' days', '-' || (abs(random()) % 86400) || ' seconds'), ?, ?, ?, ?)`);

      const employees = [
        { employeeNo: '102', cardNo: '182343532', name: '张三', department: '政治部' },
        { employeeNo: '103', cardNo: '182343533', name: '李四', department: '技术部' },
        { employeeNo: '104', cardNo: '182343534', name: '王五', department: '市场部' },
        { employeeNo: '105', cardNo: '182343535', name: '赵六', department: '财务部' }
      ];

      for (let i = 0; i < 20; i++) {
        const emp = employees[i % employees.length];
        const userId = (i % 12) + 1;
        const amount = [12.5, 15.0, 8.0, 22.0, 10.0][i % 5];
        const balance = 264.5 - (i * 12.5);
        const serialNo = String(100000 + i);
        const machineNo = String((i % 5) + 1);

        stmt.run(userId, emp.employeeNo, emp.cardNo, emp.name, emp.department, amount, balance, serialNo, machineNo);
      }

      stmt.finalize();
      console.log('消费记录测试数据已插入');
    }
  });

  db.get("SELECT COUNT(*) as count FROM dish_specs", (err, row) => {
    if (row.count === 0) {
      const stmt = db.prepare("INSERT INTO dish_specs (dish_id, spec_name, spec_content, created_by) VALUES (?, ?, ?, 'admin')");
      
      for (let i = 1; i <= 6; i++) {
        const dishId = ((i - 1) % 6) + 1;
        const specNames = ['口味', '辣度', '分量', '温度'];
        const specContents = ['清淡,少辣', '微辣,中辣,重辣', '小份,中份,大份', '常温,热,烫'];
        
        stmt.run(dishId, specNames[(i-1) % 4], specContents[(i-1) % 4]);
      }
      stmt.finalize();
      console.log('菜品规格测试数据已插入');
    }
  });
}

module.exports = { db, initDatabase };
