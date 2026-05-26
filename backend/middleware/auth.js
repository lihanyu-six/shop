const jwt = require('jsonwebtoken');

const JWT_SECRET = 'canteen-secret-key-2024';

function authMiddleware(ctx, next) {
  const authHeader = ctx.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    ctx.status = 401;
    ctx.body = { error: '未提供认证令牌' };
    return;
  }

  const token = authHeader.slice(7);
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    ctx.state.user = decoded;
    return next();
  } catch (err) {
    ctx.status = 401;
    ctx.body = { error: '无效的认证令牌' };
  }
}

module.exports = { authMiddleware, JWT_SECRET };
