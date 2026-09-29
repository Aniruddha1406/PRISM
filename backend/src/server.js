const config = require('./config');
const { getDb } = require('./config/database');
const app = require('./app');

async function start() {
  // Initialize database (creates tables if they don't exist)
  await getDb();
  console.log('Database initialized.');

  app.listen(config.PORT, () => {
    console.log(`Backend server running on http://localhost:${config.PORT}`);
    console.log(`Health check: http://localhost:${config.PORT}/api/v1/health`);
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
