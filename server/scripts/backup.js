// npm run backup
const mongoose = require('mongoose');
const { env } = require('../src/config/env');
const { runBackup } = require('../src/services/backupService');

async function main() {
  await mongoose.connect(env.MONGODB_URI);
  console.log('Connected to MongoDB, starting backup...\n');
  try {
    await runBackup();
  } finally {
    await mongoose.disconnect();
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Backup failed:', error);
    process.exit(1);
  });
