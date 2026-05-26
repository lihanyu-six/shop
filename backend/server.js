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
const statisticsRouter = require('./routes/statistics');
const usersRouter = require('./routes/users');
const adminFeedbackRouter = require('./routes/admin-feedback');
const adminSurveysRouter = require('./routes/admin-surveys');
const reservationsRouter = require('./routes/reservations');
const adminConsumptionRouter = require('./routes/admin-consumption');
const adminNoticesRouter = require('./routes/admin-notices');
const adminDishesRouter = require('./routes/admin-dishes');
const dishSpecsRouter = require('./routes/dish-specs');

const app = new Koa();
const router = new Router();

app.use(cors());
app.use(bodyParser());

initDatabase();

router.use('/api/auth', authRoutes.routes());
router.use('/api/dishes', dishRoutes.routes());
router.use('/api/orders', orderRoutes.routes());
router.use('/api/feedback', feedbackRoutes.routes());
router.use('/api/feedback', adminFeedbackRouter.routes());
router.use('/api/surveys', surveyRoutes.routes());
router.use('/api/surveys', adminSurveysRouter.routes());
router.use('/api/notices', noticeRoutes.routes());
router.use('/api/statistics', statisticsRouter.routes());
router.use('/api/users', usersRouter.routes());
router.use('/api/reservations', reservationsRouter.routes());
router.use('/api/consumption', adminConsumptionRouter.routes());
router.use('/api/admin/notices', adminNoticesRouter.routes());
router.use('/api/dishes', adminDishesRouter.routes());
router.use('/api/dish-specs', dishSpecsRouter.routes());

router.get('/', async (ctx) => {
  ctx.body = { message: '食堂订餐系统API服务已启动' };
});

app.use(router.routes());
app.use(router.allowedMethods());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
