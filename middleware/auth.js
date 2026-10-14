const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('./asyncHandler');

const cookieName = 'library_token';

const requireAuth = asyncHandler(async (req, res, next) => {
  const authorization = req.get('authorization');
  const token = req.cookies[cookieName] ||
    (authorization && authorization.startsWith('Bearer ')
      ? authorization.slice('Bearer '.length)
      : null);

  if (!token) return res.status(401).json({ error: 'Authentication required.' });

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Invalid or expired authentication token.' });
    }
    throw error;
  }

  if (!payload || typeof payload === 'string' || typeof payload.sub !== 'string') {
    return res.status(401).json({ error: 'Invalid or expired authentication token.' });
  }

  const user = await User.findById(payload.sub);
  if (!user) return res.status(401).json({ error: 'Invalid or expired authentication token.' });

  req.user = user;
  return next();
});

function requireRole(role) {
  return function roleAuthorization(req, res, next) {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: 'You do not have permission to perform this action.' });
    }
    return next();
  };
}

function tokenCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 1000,
  };
}

function clearTokenCookie(res) {
  const { httpOnly, secure, sameSite, path } = tokenCookieOptions();
  res.clearCookie(cookieName, { httpOnly, secure, sameSite, path });
}

module.exports = { clearTokenCookie, cookieName, requireAuth, requireRole, tokenCookieOptions };
