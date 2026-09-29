const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { getDb, saveDb } = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// GET /api/v1/users — list all users (admin only)
router.get('/', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const db = await getDb();
    const results = db.exec('SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC');
    const users = results.length > 0 ? results[0].values.map(row => ({
      id: row[0], email: row[1], name: row[2], role: row[3], createdAt: row[4]
    })) : [];
    res.json({ users });
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/users/:id/role — change user role (admin only)
router.put('/:id/role', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const { role } = req.body;
    const validRoles = ['ADMIN', 'EDITOR', 'MEDIA'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: { code: 'INVALID_ROLE', message: 'Invalid role specified.' } });
    }
    const db = await getDb();
    db.run('UPDATE users SET role = ?, updated_at = datetime("now") WHERE id = ?', [role, req.params.id]);
    saveDb();
    res.json({ message: 'Role updated.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
