// Dumps every collection to timestamped JSON files under backups/.
// Runs weekly from server.js, or on demand with `npm run backup`.
const fs = require('fs');
const path = require('path');
const { User } = require('../models/User');
const { Resident } = require('../models/Resident');
const { Room } = require('../models/Room');
const { Allocation } = require('../models/Allocation');
const { MaintenanceRequest } = require('../models/MaintenanceRequest');
const { Invoice } = require('../models/Invoice');
const { Notification } = require('../models/Notification');
const { Expense } = require('../models/Expense');

// Password hashes are kept (a restore needs them). backups/ is git-ignored.
const collections = {
  users: User,
  residents: Resident,
  rooms: Room,
  allocations: Allocation,
  maintenanceRequests: MaintenanceRequest,
  invoices: Invoice,
  notifications: Notification,
  expenses: Expense,
};

const BACKUPS_DIR = path.join(__dirname, '../../backups');
const KEEP_LAST_N_BACKUPS = 10;

// Uses the existing mongoose connection. The caller opens and closes it.
async function runBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outDir = path.join(BACKUPS_DIR, timestamp);
  fs.mkdirSync(outDir, { recursive: true });

  for (const [name, Model] of Object.entries(collections)) {
    const docs = await Model.find().lean();
    fs.writeFileSync(path.join(outDir, `${name}.json`), JSON.stringify(docs, null, 2));
    console.log(`[backup] ${docs.length.toString().padStart(4)} document(s) → ${name}.json`);
  }

  pruneOldBackups();

  console.log(`[backup] Complete: ${outDir}`);
  return outDir;
}

// Folder names are ISO timestamps, so sorting by name sorts by date.
function pruneOldBackups() {
  if (!fs.existsSync(BACKUPS_DIR)) return;

  const entries = fs
    .readdirSync(BACKUPS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  const toDelete = entries.slice(0, Math.max(0, entries.length - KEEP_LAST_N_BACKUPS));
  toDelete.forEach((name) => {
    fs.rmSync(path.join(BACKUPS_DIR, name), { recursive: true, force: true });
    console.log(`[backup] Pruned old backup: ${name}`);
  });
}

module.exports = { runBackup };
