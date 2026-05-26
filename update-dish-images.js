const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'canteen.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('正在更新菜品图片链接...');

const newImages = [
  "https://images.unsplash.com/photo-1623595119708-26b1f7300075?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1536304993881-ff6e9eefa256?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=300&h=300&fit=crop"
];

db.serialize(() => {
  const stmt = db.prepare("UPDATE dishes SET image = ? WHERE id = ?");
  
  for (let i = 0; i < newImages.length; i++) {
    stmt.run(newImages[i], i + 1);
    console.log(`更新菜品 ${i + 1} 的图片: ${newImages[i]}`);
  }
  
  stmt.finalize();

  db.all("SELECT id, name, image FROM dishes", [], (err, dishes) => {
    if (err) {
      console.error('查询失败:', err);
    } else {
      console.log('\n菜品图片已更新:');
      dishes.forEach(dish => {
        console.log(`${dish.id}. ${dish.name}: ${dish.image}`);
      });
    }
    db.close();
    console.log('\n完成！请刷新前端页面查看效果。');
  });
});
