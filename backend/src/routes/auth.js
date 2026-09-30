const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { z } = require('zod');
const config = require('../config');
const { getDb, saveDb } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

function setTokenCookies(res, userId, role) {
  const accessToken = jwt.sign({ userId, role }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRY });
  const refreshToken = jwt.sign({ userId }, config.JWT_REFRESH_SECRET, { expiresIn: config.JWT_REFRESH_EXPIRY });

  const cookieOpts = {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  };

  res.cookie('accessToken', accessToken, { ...cookieOpts, maxAge: 15 * 60 * 1000 });
  res.cookie('refreshToken', refreshToken, { ...cookieOpts, maxAge: 7 * 24 * 60 * 60 * 1000 });
}

// POST /api/v1/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const db = await getDb();

    // Check existing
    const check = db.prepare('SELECT id FROM users WHERE email = ?');
    check.bind([data.email]);
    if (check.step()) {
      check.free();
      return res.status(409).json({ error: { code: 'CONFLICT', message: 'Email already registered.' } });
    }
    check.free();

    const id = uuidv4();
    const hashedPassword = await bcrypt.hash(data.password, 12);
    
    db.run(
      'INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)',
      [id, data.email, hashedPassword, data.name, 'MEDIA']
    );
    saveDb();

    setTokenCookies(res, id, 'MEDIA');

    res.status(201).json({
      user: { id, email: data.email, name: data.name, role: 'MEDIA' }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const db = await getDb();

    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    stmt.bind([data.email]);
    
    if (!stmt.step()) {
      stmt.free();
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid credentials.' } });
    }

    const user = stmt.getAsObject();
    stmt.free();

    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid credentials.' } });
    }

    setTokenCookies(res, user.id, user.role);

    res.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/auth/refresh
router.post('/refresh', async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'No refresh token.' } });
    }

    const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET);
    const db = await getDb();
    const stmt = db.prepare('SELECT id, email, name, role FROM users WHERE id = ?');
    stmt.bind([decoded.userId]);
    
    if (!stmt.step()) {
      stmt.free();
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'User not found.' } });
    }

    const user = stmt.getAsObject();
    stmt.free();

    setTokenCookies(res, user.id, user.role);
    res.json({ user });
  } catch (err) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid refresh token.' } });
  }
});

// POST /api/v1/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out.' });
});

// GET /api/v1/auth/me
router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
