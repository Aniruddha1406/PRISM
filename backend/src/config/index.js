require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  DATABASE_PATH: process.env.DATABASE_URL?.replace('file:', '') || './data/ncpor.db',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_dev_secret',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret',
  JWT_EXPIRY: '15m',
  JWT_REFRESH_EXPIRY: '7d',
  NODE_ENV: process.env.NODE_ENV || 'development',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  UPLOAD_DIR: './uploads',
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  ROLES: ['ADMIN', 'EDITOR', 'MEDIA'],
  CONTENT_STATUSES: ['DRAFT', 'PENDING_APPROVAL', 'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED'],
};
