const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const cors = require('koa-cors');
const { initDatabase } = require('./database');
const authRoutes = require('./routes/auth');
const dishRoutes = require('./routes/dishes');
const orderRoutes = require('./routes/orders');
const feedbackRoutes = require('./routes/feedback');
const surveyRoutes = require('./routes/surveys');
const noticeRoutes = require('./routes/notices');

const app = new Koa();
const router = new Router();

app.use(cors());
app.use(bodyParser());

initDatabase();

router.use('/api/auth', authRoutes.routes());
router.use('/api/dishes', dishRoutes.routes());
router.use('/api/orders', orderRoutes.routes());
router.use('/api/feedback', feedbackRoutes.routes());
router.use('/api/surveys', surveyRoutes.routes());
router.use('/api/notices', noticeRoutes.routes());

router.get('/', async (ctx) => {
  ctx.body = { message: '食堂订餐系统API服务已启动' };
});

app.use(router.routes());
app.use(router.allowedMethods());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
