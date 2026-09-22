const cron = require('node-cron');
const mongoose = require('mongoose');
const app = require('./app');
const { connectDB } = require('./config/db');
const { env } = require('./config/env');
const { runBillingReminders } = require('./services/reminderService');
const { runBackup } = require('./services/backupService');

function scheduleJobs() {
  // Billing reminders, every day at 9 AM.
  cron.schedule('0 9 * * *', () => {
    runBillingReminders().catch((error) => console.error('[reminders] Scheduled sweep failed:', error));
  });

  // Also run once after boot. The 24h per-invoice throttle prevents repeats.
  setTimeout(() => {
    runBillingReminders().catch((error) => console.error('[reminders] Startup sweep failed:', error));
  }, 15_000).unref();

  // Weekly backup, Sunday 3 AM.
  cron.schedule('0 3 * * 0', () => {
    runBackup().catch((error) => console.error('[backup] Scheduled backup failed:', error));
  });
}

async function start() {
  await connectDB();

  const server = app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT} (${env.NODE_ENV})`);
  });

  scheduleJobs();

  // Graceful shutdown: finish in-flight requests, then close the DB connection.
  const shutdown = (signal) => {
    console.log(`${signal} received, shutting down...`);
    cron.getTasks().forEach((task) => task.stop());
    server.close(async () => {
      await mongoose.connection.close();
      process.exit(0);
    });
    // Force exit if connections don't close in time.
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});

start();
