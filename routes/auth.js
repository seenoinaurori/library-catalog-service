const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const { clearTokenCookie, cookieName, tokenCookieOptions } = require('../middleware/auth');

const router = express.Router();

function invalidRequest(res, details) {
  return res.status(400).json({ error: 'Validation failed', details });
}

function publicUser(user) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
  };
}

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { body } = req;
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return invalidRequest(res, [{ field: 'body', message: 'must be a JSON object' }]);
    }

    const allowedFields = ['username', 'email', 'password'];
    const details = Object.keys(body)
      .filter((field) => !allowedFields.includes(field))
      .map((field) => ({ field, message: 'is not an allowed field' }));

    for (const field of allowedFields) {
      if (typeof body[field] !== 'string' || body[field].trim() === '') {
        details.push({ field, message: 'is required and must be a non-empty string' });
      }
    }

    if (typeof body.username === 'string' && (body.username.trim().length < 3 || body.username.trim().length > 50)) {
      details.push({ field: 'username', message: 'must be between 3 and 50 characters' });
    }
    if (
      typeof body.email === 'string' &&
      (body.email.trim().length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim()))
    ) {
      details.push({ field: 'email', message: 'must be a valid email address' });
    }
    if (
      typeof body.password === 'string' &&
      (Buffer.byteLength(body.password, 'utf8') < 8 || Buffer.byteLength(body.password, 'utf8') > 72)
    ) {
      details.push({ field: 'password', message: 'must be between 8 and 72 UTF-8 bytes' });
    }

    if (details.length) return invalidRequest(res, details);

    const user = await User.create({
      username: body.username.trim(),
      email: body.email.trim().toLowerCase(),
      password: body.password,
    });
    return res.status(201).json({ data: publicUser(user) });
  })
);

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body || {};
    if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
      return invalidRequest(res, [
        { field: 'email', message: 'is required' },
        { field: 'password', message: 'is required' },
      ]);
    }
    if (Buffer.byteLength(password, 'utf8') > 72) {
      return invalidRequest(res, [{ field: 'password', message: 'must not exceed 72 UTF-8 bytes' }]);
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign({}, process.env.JWT_SECRET, {
      subject: user._id.toString(),
      expiresIn: '1h',
    });
    res.cookie(cookieName, token, tokenCookieOptions());
    return res.status(200).json({ data: publicUser(user) });
  })
);

router.post('/logout', (req, res) => {
  clearTokenCookie(res);
  return res.status(200).json({ message: 'Logged out.' });
});

module.exports = router;
