const jwt = require('jsonwebtoken');
const config = require('../config');
const { getDb } = require('../config/database');

// Verify JWT token from httpOnly cookie
async function authenticate(req, res, next) {
  try {
    const token = req.cookies?.accessToken;
    if (!token) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    const db = await getDb();
    const stmt = db.prepare('SELECT id, email, name, role FROM users WHERE id = ?');
    stmt.bind([decoded.userId]);
    
    if (stmt.step()) {
      const row = stmt.getAsObject();
      req.user = row;
      stmt.free();
      next();
    } else {
      stmt.free();
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'User not found.' } });
    }
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: { code: 'TOKEN_EXPIRED', message: 'Token has expired.' } });
    }
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid token.' } });
  }
}

// Role-based access control
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Insufficient permissions.' } });
    }
    next();
  };
}

// Optional auth — sets req.user if token present, otherwise continues
async function optionalAuth(req, res, next) {
  try {
    const token = req.cookies?.accessToken;
    if (!token) return next();

    const decoded = jwt.verify(token, config.JWT_SECRET);
    const db = await getDb();
    const stmt = db.prepare('SELECT id, email, name, role FROM users WHERE id = ?');
    stmt.bind([decoded.userId]);
    
    if (stmt.step()) {
      req.user = stmt.getAsObject();
    }
    stmt.free();
    next();
  } catch {
    next();
  }
}

module.exports = { authenticate, authorize, optionalAuth };
